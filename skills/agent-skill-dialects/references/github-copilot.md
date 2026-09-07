# GitHub Copilot(VS Code / CLI / Cloud)

> 核对日期:2026-09-07
> 官方来源:https://code.visualstudio.com/docs/copilot/customization/agent-skills
> 定位:同套格式横跨 **VS Code 的 Copilot Chat / Agent 模式、Copilot CLI、Copilot cloud agent**;扩展为"**调用可见性 + 子上下文**":`user-invocable`、`disable-model-invocation`、`context: inline|fork`、`argument-hint`,外加扩展(extension)分发。

---

## 1. 目录扫描与作用域

| 类型 | 位置 |
|---|---|
| 项目技能 | `.github/skills/<name>/SKILL.md`、`.claude/skills/`、`.agents/skills/` |
| 个人技能 | `~/.copilot/skills/`、`~/.claude/skills/`、`~/.agents/skills/` |

- 可加项目目录:`chat.agentSkillsLocations` 设置追加自定义技能目录。
- monorepo:启用 `chat.useCustomizationsInParentRepositories` 才会去父仓库根发现技能。
- 分发来源还包括:社区仓库(如 `github/awesome-copilot`、`anthropics/skills`)、插件内置技能(出现在 Configure Skills 菜单)。

## 2. frontmatter:字段与严格校验

| 字段 | 必填 | 规则 / 行为 |
|---|---|---|
| `name` | **是** | 仅小写字母/数字/连字符;禁止 `/`、`:`、`.` 与命名空间前缀;≤64 字符;**必须与父目录名一致,否则技能静默不加载**(不报错) |
| `description` | **是** | 做什么 + 何时用;≤1024 字符 |
| `argument-hint` | 否 | 斜杠调用时输入框提示,如 `[test file] [options]` |
| `user-invocable` | 否(默认 `true`) | `false`:从 `/` 菜单与斜杠调用隐藏,模型仍可自动加载 |
| `disable-model-invocation` | 否(默认 `false`) | `true`:禁止模型自动加载,只允许 `/name` 手动 |
| `context` | 否(默认 `inline`) | `fork`:在独立子 agent 上下文执行,只把最终结果交还主会话(实验性) |

- 插件分发时插件名自动成为命令前缀(`/my-plugin:test-runner`);**不要在 `name` 里手工加前缀**,否则静默失败。

## 3. 渐进式三层加载(官方明确三阶段)

1. **Discovery**:只读 frontmatter 的 `name`+`description`,按你的请求匹配。
2. **Instructions loading**:命中后把 SKILL.md 正文装入上下文;手动 `/name` 直接触发这一层。
3. **Resource access**:正文引用到技能目录内文件(如 `./test-template.js`)才读取;**未被引用的文件不会加载**。

- `context: fork` 的技能:Discovery 同前,但 Instructions 与文件读取都发生在独立子 agent,主会话只收最终结果——适合"读很多文件/长调查/结论聚焦"的技能。
- fork 需要开启 VS Code 设置 `github.copilot.chat.skillTool.enabled`(实验特性,可能变动)。

## 4. 手动调用与生成器

- 手动斜杠 `/skill-name`,参数追加在命令后;`/skills` 打开 Configure Skills 菜单。
- `/create-skill` 通过对话生成技能;也可在 Agent Customizations 编辑器里 Generate Skill,或从一段已完成的排查对话中"提炼成技能"。

## 5. 扩展分发(chatSkills)

```json
// extension/package.json
{
  "contributes": {
    "chatSkills": [
      { "path": "./skills/my-skill/SKILL.md" }
    ]
  }
}
```

- 目录结构:扩展根 `skills/my-skill/SKILL.md`;**目录名必须等于 `name`**,否则不加载。
- 路径指向 SKILL.md 文件本身(Agent Skills 规范目录形态)。
- 同一格式被 Copilot CLI / cloud agent 复用;CLI/模型侧另有磁盘位置供内置命令使用,与本文目录技能同构。

## 6. 适配清单(把通用技能适配到 Copilot)

- [ ] `name` 严格小写字母数字连字符、≤64、**无 `/ : .` 与命名空间前缀**,且目录名 = `name`——三者任一违规都会**静默不加载**,务必自测。
- [ ] `description` ≤1024,且正文里**用相对路径引用**同目录资源,否则 Resource 层不会读取。
- [ ] 想让用户可见为斜杠命令 → 保持 `user-invocable: true`;"仅作背景、不进菜单"→ `false`。
- [ ] 想"仅手动"→ `disable-model-invocation: true`。
- [ ] 长调查类技能希望不污染主会话 → `context: fork`(提醒用户需开 `github.copilot.chat.skillTool.enabled`)。
- [ ] 输入提示 → `argument-hint`。
- [ ] 装到 VS Code 用 `.github/skills/` 或 `~/.copilot/skills/`;要跨 CLI/cloud 复用则内容保持标准(仅 name/description/正文 + 相对资源)。
- [ ] 对外分发给他人装 → 用插件 `chatSkills` 贡献点,不要手工前缀。

## 7. 与标准基线差异速查

| 维度 | agentskills.io 基线 | Copilot |
|---|---|---|
| `name` 校验 | 建议 | 仅小写字母数字连字符、≤64、=目录名,否则静默失败 |
| 描述上限 | 建议 ≤1024 | 硬限 1024 |
| 子上下文执行 | 无 | `context: fork`(实验性,需设置开关) |
| 手动提示 | — | `argument-hint` |
| 双向开关 | 无 | `user-invocable` + `disable-model-invocation` |
| 渐进加载 | 普遍采纳 | 官方明确三层:Discovery → Instructions → Resources |
| 分发 | 复制目录 | VS Code 扩展 `chatSkills`、社区仓库 |
