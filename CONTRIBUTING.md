# Contributing to agent-skill-dialects

感谢你愿意改进这个「各厂商 Agent Skills 方言」参考项目。

## Repository layout

仓库没有运行时实现或构建。它只包含技能定义、参考语料、文档、打包元数据与静态契约校验。

| 变更 | 要改的文件 |
|------|-----------|
| 厂商行为/字段/适配清单 | `skills/agent-skill-dialects/references/<vendor>.md` |
| 技能路由与通用准则 | `skills/agent-skill-dialects/SKILL.md` 及其映射表 |
| 厂商对比总览 | `docs/zh/overview.md`、`docs/en/overview.md` |
| 用户可见安装/用法 | `README.md`、`README-zh.md` |
| 版本号 | `.claude-plugin/plugin.json`、`package.json`、`SKILL.md` frontmatter(`metadata.version`) |
| 静态契约 | `scripts/check-skill-contract.js` |
| 版本解析与 tag 对齐 | `scripts/check-versions.js` |
| CI | `.github/workflows/test.yml`、`.github/workflows/publish.yml` |
| 依赖变更 | `package.json`、`package-lock.json` |

## Making a change

1. 改一家厂商只动 `references/<vendor>.md`;若改动了路由顺序或新增厂商,同步 `SKILL.md` 映射表;若改动涉及字段/调用/覆盖/目录等维度,同步 `SKILL.md`「关键差异速查」对应行。
2. 每条行为差异必须可溯源:文件顶部更新「核对日期」,「官方来源」给出真实 URL;无法逐字核对的内容显式标注(如"官方页 403,以博客/Air Help 佐证,待复核")。
3. 跨厂商对比变化时更新 `docs/zh/overview.md` 与 `docs/en/overview.md`(两者讲同一件事)。
4. 用户可见行为变化时保持 `README.md` 与 `README-zh.md` 同步(脚本强制中英小节数一致)。
5. 更新 `CHANGELOG.md`。
6. 运行 `npm ci && npm test`——它会验证:版本三处一致、SKILL 路由表与 references/ 一一对应(references/ 单层)、每份参考文档头三行齐全(含位置与顺序)、代码围栏配对、无旧技能名与 `【F:…】` 引用标记、文档内本地链接有效、npm 包内容覆盖已发布文档的本地引用(`npm pack --dry-run` 比对)、README/docs-en 语言分区。

## Language conventions

- 参考语料与维护文档(SKILL.md 正文、references/、AGENTS.md、CLAUDE.md、docs/zh/、README-zh.md)用**中文**。
- `README.md` 与 `docs/en/` 用**英文**,作为中文文档的对齐摘要,不是逐字翻译。
- SKILL.md 的 `description` 带双语触发词——编辑时保持中英都在。

## Design constraints(read before proposing content)

本项目是**按需查阅的参考指针**,不是运行时行为约束:

- SKILL.md 正文只做路由与通用准则;任何厂商细节放 references,不要搬进入口。
- 不承诺"全兼容"——文档目的是指出"某字段在某厂商会被跳过/拒绝/静默失败",从而让作者写出可移植主干。
- 未知/未核实字段**宁缺勿写**,并显式标"待复核";绝不发明字段或默认值。
- 不要在本仓库里夹带厂商专有技能的实现,这里只做对照参考。

## Releasing(maintainers)

1. 在三处提升版本号:`.claude-plugin/plugin.json`、`package.json`、`skills/agent-skill-dialects/SKILL.md` frontmatter `metadata.version`。
2. `npm ci && npm test` 必须通过。
3. 把 CHANGELOG 的 `[Unreleased]` 条目移到发布日期下。
4. `npm pack --dry-run` 人工复核包内容(README 本地引用的覆盖关系已由 `npm test` 自动校验)。
5. 打 `vX.Y.Z` tag 并推送;CI 校验 tag 与版本一致并发布到官方 npm registry。

### First npm publication

包是 scoped 且必须公开。`package.json` 已固定 `publishConfig.access` 与 `publishConfig.registry`,不要依赖开发者本机 npm 配置。首次发布流程(与仓库同款,来自 hiding-skill 的设计):

1. 显式登录官方 registry:`npm login --scope=@huatalk --registry=https://registry.npmjs.org/`。
2. `npm whoami --registry=https://registry.npmjs.org/` 确认是 `huatalk`;若 `@huatalk` 是 org scope,用 `npm org ls huatalk` 确认你有建包权限。
3. 创建短期/细粒度、具备 publish 权限的 npm token,存为仓库 secret `NPM_TOKEN`。
4. 推发布 tag。存在 `NPM_TOKEN` 时,`publish` workflow 用它完成首次发布(Trusted Publisher 在包不存在时无法配置)。

包存在后,在 npm 上给 `@huatalk/agent-skill-dialects` 配置 Trusted Publisher:GitHub owner `HuaTalk`、repository `agent-skill-dialects`、workflow `publish.yml`;然后删除 `NPM_TOKEN` secret。之后 `v*` tag 走 GitHub Actions OIDC 发布,不再读 npm token。
