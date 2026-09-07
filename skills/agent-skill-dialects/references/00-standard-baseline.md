# 00 · 标准基线:Agent Skills 开放格式(agentskills.io)

> 核对日期:2026-09-07
> 官方来源:https://agentskills.io (Anthropic 主导的开放格式;Claude Code / OpenAI Codex / Gemini CLI / Windsurf 等在官方文档中直接引用该规范)
> 定位:所有厂商都至少实现了本文件内容的"最小公共子集"。写任何跨厂商通用技能前,先读本文,再读目标厂商文档。

---

## 1. 标准定义了什么(最小公共子集)

| 项目 | 标准内容 | 说明 |
|---|---|---|
| 组织形态 | `<skills-root>/<skill-name>/SKILL.md` | skill 名 = 目录名;技能必须放进一个目录 |
| 必填 frontmatter | `name`、`description` | 仅这两个字段是标准要求 |
| `name` 规则 | 小写 ASCII 字母/数字/连字符,1-64 字符,与目录名一致 | 多数厂商有该约定(差异见各厂商文档) |
| `description` | 让模型判断"何时调用",建议 ≤1024 字符 | 触发匹配的核心;写"做什么 + 何时用" |
| 正文 | Markdown 指令 | 按需/渐进披露,不常驻系统提示词 |
| 附带资源 | `scripts/`、`references/`、`docs/`、`templates/`、`assets/` | 目录惯例(非强制的组织建议) |
| 自动调用 | 模型根据 `description` 判断是否加载 | 显式斜杠调用是产品层行为,标准未规定 |
| 推荐安装位置 | `.claude/skills`、`.agents/skills`、`.gemini/skills` 等命名空间目录 | 目录本身不跨标准统一 |

**标准刻意没有定义的**(即本仓库调研重点,均属厂商扩展):父子/层级 skill
(`has-sub-skill`)、`allowed-tools`、`user-invocable`、`disable-model-invocation`、
`context: fork|inline`、`type`(prompt/inline/flow)、`arguments`、`whenToUse`、
`priority`、`paths`/`globs`、`icon`/`color`/`metadata`、`argument-hint`、
mode 专属目录(`skills-{mode}`)、目录限定名(`apps/web:deploy`)、插件/市场分发、
生命周期工具(`/learn`、`/curator`、`/create-skill`)、同名覆盖链优先级。

## 2. "渐进披露"三层约定(各厂商普遍采用,细节有差异)

1. **元数据层**:启动/索引时只读 frontmatter 的 `name` + `description`,用于匹配。成本约每技能 ~100 tokens。
2. **指令层**:命中后才把 SKILL.md 正文载入上下文。常见建议单文件 <5k tokens,超长拆到 `docs/`。
3. **资源层**:正文引用脚本/模板时按需读取(`read_file` 或执行脚本只返回输出)。

> 注意:上下文预算/截断规则厂商不同——Codex 把"技能清单"控制在 ~2% 上下文并优先截短 description;多数厂商对超长 description 直接截断。

## 3. 一套"标准技能"的建议写法(可移植主干)

```yaml
---
name: my-skill
description: What it does and when to use it. Use when <触发场景>.
---
# My Skill
(正文:流程、示例、边界情况)
- 需要更多细节时读取同目录 `docs/xxx.md`。
- 确定性操作优先执行 `scripts/xxx.py`,不要把大段输出贴进上下文。
```

规则:
- `name` 只用小写字母/数字/连字符;目录名 = name。
- 核心逻辑只依赖 `name`/`description` + 正文。厂商专有字段一律视为增强,不得作为主干。
- `description` 开头放关键词(做什么),再写触发场景——上下文不足被截断时仍保留关键信息。
- 正文用相对路径引用同目录资源,跨厂商通用。

## 4. 跨厂商"同名字段,不同行为"速查(详见各厂商文档)

| 字段/机制 | 典型取值 | 厂商差异提示 |
|---|---|---|
| 调用开关 | `user-invocable: false` | Claude/Copilot/Qwen 支持;Kimi 无直接等价字段(`whenToUse` 只追加触发描述,不是用户侧隐藏) |
| 禁用自动调用 | `disable-model-invocation: true` | Claude/Qwen/Cursor/Copilot 支持;Kimi 用 `disableModelInvocation`(也接受下划线别名) |
| 子上下文执行 | `context: fork` | Copilot fork 子 agent;Claude fork 为 subagent 执行;Cline 支持资源层子上下文 |
| 工具白名单 | `allowed-tools` | Claude 独有(限制该 skill 可用的工具);其余厂商无此字段 |
| 显式调用语法 | `/name`、`/skill:<name>`、`@name`、`$name` | Kimi `/skill:`;Windsurf/Copilot `@`;Codex `$` 或 `/skills`;属产品层行为 |
| 非法值处理 | — | Kimi 未知 `type` 值整技能跳过;Qwen 非法 `name` 解析期拒绝;Copilot name 不匹配目录静默失败 |

## 5. 与"本仓库其余文档"配合使用的决策顺序

1. 目标厂商文档宣称"遵循 agentskills.io"(Claude/Codex/Gemini/Windsurf…):仍须读厂商文档,因为字段扩展与目录扫描规则不同。
2. 目标是"同时适配多家":以本文为公共主干,厂商差异走"单目录标准主干 + 增强选项/独立变体目录"。
3. 目标是纯标准环境(如 Gemini 的克制实现):本文 + 厂商文档中的「与标准差异」节即够。
