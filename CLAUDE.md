# CLAUDE.md

本文件为 Claude Code(claude.ai/code)在本仓库工作时提供指引。核心事实与 CLAUDE.md/AGENTS.md 一致;更完整的理由见 `docs/zh/design.md` 与 `docs/en/design.md`。

## Repository Identity

一个可分发(Claude Code plugin marketplace + npm + `npx skills`)的「Agent Skills 方言」参考仓库。唯一技能 `agent-skill-dialects` 是上下文指针:正文只做路由,细节在 `skills/agent-skill-dialects/references/<vendor>.md` 按需加载。

**没有运行时实现或构建。** 仓库 = 技能定义 + 参考语料 + 打包元数据 + 静态契约校验。

## Commands

```bash
npm test                              # check-versions + check-skill-contract
node scripts/check-versions.js        # 仅版本一致性
node scripts/check-skill-contract.js  # 仅静态契约
```

CI(`.github/workflows/test.yml`)在 push 到 main、PR、`v*` tag 时跑同一批检查,并额外做 `npm pack --dry-run`。

## Core Architecture

- 入口:`skills/agent-skill-dialects/SKILL.md`(frontmatter + 路由表 + 通用可移植准则 + 关键差异速查)。
- 语料:`skills/agent-skill-dialects/references/00-standard-baseline.md` + 各家 `<vendor>.md`,单层、被 SKILL.md 路由表全覆盖。
- 其余是打包/校验/文档。

### Distribution:Two channels

| Channel | Reach | Mechanism |
|---------|-------|-----------|
| `npx skills add monadrome/agent-skill-dialects` | 70+ agents | 从 GitHub 发现 `skills/agent-skill-dialects/SKILL.md` 并安装到各 agent |
| `/plugin install agent-skill-dialects@agent-skill-dialects` | Claude Code only | 原生 plugin marketplace,经 `.claude-plugin/` |

### Version tracking

三个文件携带版本号,`check-versions.js` 强制一致:
- `.claude-plugin/plugin.json`
- `package.json`
- `skills/agent-skill-dialects/SKILL.md`(frontmatter `metadata.version`)

在 `v*` tag 上还会校验 tag 与版本一致(如 `v0.1.0`)。

## Design Philosophy

### Core Contract

- 只讲可验证事实:每份参考文档带「核对日期 + 官方来源」;拿不到原文就标注来源与待复核,不补脑。
- 标准优先:通用技能主干只用 agentskills 标准字段;厂商字段是"方言/增强",正文里明确归类。
- 按需加载:SKILL.md 正文保持精简;模型只读命中厂商的 references,不一次全量载入。
- 无副作用:本技能不改文件、不注规则、不产生输出,纯粹是路由与查阅参考。
- 中英分区:README.md/docs/en 纯英文;语料、AGENTS/CLAUDE、docs/zh 中文;SKILL description 双语。

### What we don't do

- 不把各家细节搬进 SKILL.md(细节属于 references)。
- 不为未核实的字段/行为写文档。
- 不承诺"所有厂商字段全兼容"——文档的目标是让作者知道"某字段在某厂商会被跳过/拒绝/静默失败"。
- 不维护厂商的专有技能实现,只做对照与移植参考。

## Reference Structure

- SKILL.md 路由表 = references/ 的唯一索引;两者必须一一对应(脚本强制)。
- 每个 references 文件自包含:顶部三行(核对日期/官方来源/定位)后即可独立阅读。
- 同构小标题:定位 → 目录与作用域 → frontmatter 与厂商扩展 → 加载/调用 → 适配清单 → 与标准基线差异速查。
- 适配清单用 checkbox,是跨厂商移植时逐条核对的入口。

## File Map

| 想改什么 | 改哪里 |
|---------|--------|
| 某厂商细节 | `references/<vendor>.md` |
| 路由/通用准则/速查表 | `SKILL.md` |
| 厂商对比总览(结论/矩阵) | `docs/zh/overview.md`、`docs/en/overview.md` |
| 设计取舍、命名与方言隐喻 | `docs/zh/design.md`、`docs/en/design.md` |
| 维护节奏与来源清单 | `docs/zh/maintenance.md`、`docs/en/maintenance.md` |
| 双语文档一致性 | `README.md` ↔ `README-zh.md`(小节数相等由脚本强制) |
| 新增厂商 | references + SKILL.md 映射表 + README 目录树 + overview 矩阵 |

## Change Checklist

- SKILL.md `description` 与 `metadata.version` 只在有意变更时修改;description 保持双语。
- 新增/修改厂商文档后跑 `npm test`(强制映射表同步、头三行、围栏、无旧名/引用标记、链接有效)。
- 用户可见行为变化时同步 README 双语并保持小节数一致。
- 修改或新增 references 文件时,官方 URL 与核对日期要真实;不确定就写"以官方为准,待复核"。
- 记录 `CHANGELOG.md`;发布走 CONTRIBUTING.md 的 Releasing 流程(三处版本一致 + tag `vX.Y.Z`)。
- 提交前检查暂存区无凭据与作者痕迹(临时路径、会话 id 等)。

## Further Reading

- Agent Skills 开放格式:https://agentskills.io
- 本仓库基准文档:`skills/agent-skill-dialects/references/00-standard-baseline.md`
- 发布/参与约定:`CONTRIBUTING.md`
