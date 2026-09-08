---
name: agent-skill-dialects
description: "Same SKILL.md, different vendor dialects. Reference for how each AI coding agent (Kimi Code / Claude Code / OpenAI Codex / Qwen Code / Cursor / GitHub Copilot / Gemini CLI / OpenHands / Trae / Junie / Kilo / Continue 等) implements or extends the agentskills.io open format: field defaults, aliases, skip or silent-failure rules, directories and scope, invocation mechanics. Use when adapting a portable SKILL.md to a specific vendor or porting a skill across vendors. 同一份 SKILL.md 在不同厂商中方言不同,适配或跨厂商移植前先查目标厂商的行为差异。"
metadata:
  author: monadrome
  version: "0.1.0"
  category: reference
---

# Agent Skill Dialects

本技能是一个"上下文指针":正文不搬运细节,而是按目标厂商路由到 `references/` 下对应文档。这里的"方言"指同一份标准 SKILL.md 在不同厂商手里的不同读法——字段默认值、别名、跳过或静默失败规则、目录与调用机制。加载本技能后,只读取你需要的那个厂商文档,避免一次把全部内容塞进上下文。

## 用法

1. 确定目标厂商,读取 `references/` 中对应文件(见下表)。文件名即厂商键。
2. 需要跨厂商编写通用技能时,先读 `references/00-standard-baseline.md`,再读目标厂商文档,按其中的「适配清单」逐条核对。
3. 文档均含「核对日期 + 官方来源」,厂商行为变更时以官方为准,并更新本仓库(见 README 维护约定)。

| 目标厂商 / 产品 | 引用文档 |
|---|---|
| 任何厂商(标准基线) | `references/00-standard-baseline.md` |
| Anthropic Claude Code | `references/anthropic-claude-code.md` |
| Moonshot Kimi Code CLI | `references/moonshot-kimi-code.md` |
| OpenAI Codex / ChatGPT | `references/openai-codex.md` |
| Alibaba Qwen Code | `references/alibaba-qwen-code.md` |
| Anysphere Cursor | `references/cursor.md` |
| GitHub Copilot(VS Code / CLI / Cloud) | `references/github-copilot.md` |
| Google Gemini CLI | `references/gemini-cli.md` |
| Windsurf | `references/windsurf.md` |
| Roo Code | `references/roo-code.md` |
| Cline | `references/cline.md` |
| OpenHands | `references/openhands.md` |
| Trae IDE / Trae CLI | `references/trae.md` |
| JetBrains Junie | `references/jetbrains-junie.md` |
| Kilo Code | `references/kilo-code.md` |
| Continue CLI | `references/continue.md` |
| Aider(无原生支持) | `references/aider.md` |

## 通用可移植准则(跨所有厂商)

- 结构用 `<name>/SKILL.md` 目录形态;`name` 用**小写 ASCII + 连字符**,1-64 字符;目录名与 `name` 保持一致(多数厂商强制校验或推荐)。
- 只依赖标准 frontmatter(`name` / `description`)与正文实现核心逻辑。厂商专有字段一律视为"增强",不得作为主干。
- 未知/非法字段在厂商间行为差异很大:Kimi 对未知 `type` 值直接跳过;Qwen 对非法 `name` 解析期拒绝;Copilot 对非法 `name` 静默不加载。写作时避免踩这些坑。
- `description` 同时写"做什么"和"什么时候用",关键词前置——多个厂商在上下文预算不足时会截断 description(Codex 会优先缩短)。
- 同一技能需要利用厂商增强时,优先"一个目录 + 标准主干",增强做成可选段落或厂商单独安装的变体(如 `.claude/skills/` 装增强版、`.agents/skills/` 装标准版),而不是互相污染。
- 正文中引用同目录资源用相对路径;资源按需加载是通用约定(`scripts/`、`references/`、`assets/`)。

## 关键差异速查

| 维度 | 基线(agentskills.io) | 差异最大者 |
|---|---|---|
| frontmatter 必填 | `name` + `description` | Kimi 目录形态强制二者齐全,否则解析失败 |
| 手动调用 | slash `/name` | Kimi `/skill:<name>`;Cursor 技能可作为 Custom Mode 全会话常驻 |
| 自动调用开关 | 无(默认自动) | `disable-model-invocation`(Claude/Qwen/Cursor/Copilot/Kimi `disableModelInvocation`) |
| 用户侧隐藏 | 无 | `user-invocable: false`(Copilot/Qwen) |
| 工具限制 | 无 | `allowed-tools`(Claude) |
| 子上下文执行 | 无 | `context: fork`(Copilot/Claude subagent) |
| 目录限定/层级 | 无 | Kimi `has-sub-skill` 功能父子包;Claude 目录限定名;Cursor 嵌套目录仅组织用 |
| 运行编排 | 无 | Kimi `type: flow`(`/flow:<name>` 按图执行) |
| 文件路径门控 | 无 | `paths` glob(Qwen/Cursor) |
| 分发 | 复制目录 | Claude 插件、Codex/ChatGPT 插件、Cursor Marketplace、Gemini `install` |
| 冲突/覆盖 | 未规定 | Roo 四层覆盖链(计入 mode 目录为 8 级);Claude 企业>个人>项目>插件命名空间 |

## 何时不要用本技能

- 一般性技能创作问题(如何写一个好的 SKILL.md)→ 用官方 `skill-creator` 类内置技能或 agentskills.io 规范。
- 目标厂商明确是"纯标准实现"(如 Gemini CLI),→ 读 `00-standard-baseline.md` 即可,无需厂商细节。
