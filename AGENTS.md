# agent-skill-dialects — 各厂商 Agent Skills 方言参考

本仓库是一个「上下文指针」型 Agent Skill + 可离线查阅的厂商扩展语料库:同一份标准 SKILL.md 在不同 AI 编程/Agent 厂商中行为不同(字段默认值、别名、非法值跳过或静默失败、目录与 scope、调用机制),我们把这种差异称为"方言"。技能正文只做路由,细节放在 `skills/agent-skill-dialects/references/` 按需加载。

仓库没有运行时实现或构建,只有技能定义、参考文档、打包元数据与静态契约校验。

## Core Contract

- 内容以官方文档为准,禁止编造。每条行为差异必须能落到对应 `references/<vendor>.md`,文件顶部带「核对日期 + 官方来源」;官方页拿不到逐字原文时(如 Junie 403、Continue 无独立页),显式标注"以 xxx 为准 / 待复核",不得虚构字段。
- 标准优先:通用技能主干只依赖 `name`/`description` + Markdown 正文;厂商扩展一律描述为"增强",不是主干。
- 文档一律用全角中文标点,不用半角英文标点结尾;不输出 `【F:...】` 一类引用标记。
- `references/` 只放一层:文件名即厂商键(小写、连字符),全部被 SKILL.md 映射表列出,不允许孤儿文件。
- 同名冲突、非法 name 处理等差异要写明"谁和谁同风格"(如 Kilo 与 Roo 的 `skills-{mode}`),便于互操作。
- 破坏性变更必须显式标注(如 `⚠️ 自 vX.Y 起…`),并同步更新总览文档。
- 维护节奏:建议每 1–3 个月复核各文件顶部的「核对日期」与「官方来源」URL;变更后把核对日期更新为当天。

## Repository layout

| Change | Files to edit |
|--------|--------------|
| 某厂商行为/字段/清单 | `skills/agent-skill-dialects/references/<vendor>.md` |
| 技能路由与通用准则 | `skills/agent-skill-dialects/SKILL.md`(含映射表) |
| 跨厂商对比总览 | `docs/zh/overview.md` 与 `docs/en/overview.md` |
| 用户可见安装/用法 | `README.md`、`README-zh.md` |
| 新增厂商 | `references/<vendor>.md` + SKILL.md 映射表与「关键差异速查」+ README 目录树 + docs 总览 |
| 版本号 | `.claude-plugin/plugin.json`、`package.json`、`SKILL.md` frontmatter `metadata.version`(三处一致) |
| 静态契约 | `scripts/check-skill-contract.js` |
| 版本/发布 tag 对齐 | `scripts/check-versions.js` |
| CI | `.github/workflows/test.yml`、`.github/workflows/publish.yml` |

## Commands

```bash
npm test                              # 版本一致性 + Skill 契约检查(等价 npm run check)
node scripts/check-versions.js        # 仅版本一致性
node scripts/check-skill-contract.js  # 仅静态契约
```

`npm test` 通过是提交前提。契约检查覆盖:映射表与 references/ 一一对应、references/ 单层、每份文档头三行(核对日期/官方来源/定位,含位置与顺序)、代码围栏配对、禁止旧技能名与 【F: 引用标记、仓库内本地链接存在、npm 包内容覆盖已发布文档的本地引用(npm pack 比对)、README.md 与 docs/en 纯英文、README 中英小节数一致。

## Language conventions

- 参考语料与维护文档(SKILL.md 正文、references/、AGENTS.md、CLAUDE.md、docs/zh/、README-zh.md)使用**中文**。
- `README.md` 与 `docs/en/` 使用**英文**(CI 会强制),内容是中文文档的对齐摘要,不是翻译逐字稿。
- SKILL.md 的 `description` 携带**双语触发词**,编辑时保持中英都在。

## Design constraints

- 本技能是"按需查阅的参考指针",不做任何运行时注入、不产生副作用、不要求 always-on。
- 不为假设问题添加行为约束;优先用静态契约脚本保证确定性结构。
- 不要把大量厂商细节搬进 SKILL.md 正文——正文只保留路由与通用准则,细节一律按需读 references。
- 提交前 `npm test` 必须通过,且检查暂存内容无凭据、无作者痕迹(如遗留的临时路径 `/tmp/…`)。
