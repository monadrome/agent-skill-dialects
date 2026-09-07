# Windsurf Cascade

> 核对日期:2026-09-07
> 官方来源:https://docs.windsurf.com(中文镜像:https://docs.windsurf.com/zh/windsurf/cascade/skills;英文直链可能因地区/网络返回 404,建议回源校验)
> 定位:采用 **Devin CLI skills 格式与发现机制**,是"纯标准 + 互操作目录"的实现派;frontmatter 只需 `name` + `description`,配套资源放同目录即可。

---

## 1. 目录与作用域

| 层级 | 位置 | 说明 |
|---|---|---|
| Workspace(项目) | `.windsurf/skills/<name>/SKILL.md` | 项目专用,进仓库 |
| Global(个人) | `~/.codeium/windsurf/skills/<name>/SKILL.md` | 所有工作区可用 |
| Enterprise(系统级) | macOS `/Library/Application Support/Windsurf/skills/`、Linux `/etc/windsurf/skills/`、Windows `C:\ProgramData\Windsurf\skills\` | 企业统一部署,最终用户不可改 |
| 互操作 | `.agents/skills/`、`~/.agents/skills/`、`.claude/skills/`、`~/.claude/skills/` | Devin Desktop/跨 agent 发现兼容 |

- 每个技能 = 含 `SKILL.md` 的子目录;技能名限小写字母/数字/连字符。
- 官方 UI 内可直接创建:`Cascade 面板 → 右上角菜单 → Skills → + Workspace / + Global`。

## 2. frontmatter(纯标准两字段)

| 字段 | 说明 |
|---|---|
| `name` | 技能唯一标识:显示在 UI,也用于 `@name` 提及;小写字母/数字/连字符 |
| `description` | 展示给模型判断何时调用的简述 |

- 官方未引入 `disable-model-invocation`、`paths` 等控制字段(需要时用 Rules / Workflows 等其他机制配合)。
- **支持资源**:`SKILL.md` 旁放置任意支撑文件(清单、回滚流程、模板等),技能被调用时这些文件对 Cascade 可用。

```markdown
---
name: deploy-to-production
description: Guides the deployment process to production with safety checks
---
## Pre-deployment Checklist
1. Run all tests
2. Check for uncommitted changes
...
```

## 3. 调用与产品机制定位

- **自动调用**:请求与 description 匹配时,Cascade 自动加载技能及资源(最常见用法)。
- **手动调用**:输入框打 `@skill-name` 强制启用。
- **渐进披露**:默认只给模型看 `name` + `description`;完整 SKILL.md 与支撑文件在命中或 @提及后才载入。
- 产品内另有 **Rules**(短的行为约束)与 **Workflows**(永远由你手动触发)两类机制——需求是"长期行为约束"用 Rules,是"复杂多步流程"用 Skills,是"每次都要你主动触发"用 Workflows。

## 4. 适配清单

- [ ] 目录结构 `<name>/SKILL.md` + 支撑文件同目录;名字小写字母数字连字符。
- [ ] 装到 `.windsurf/skills/`(项目)或 `~/.codeium/windsurf/skills/`(全局);要跨 agent 就放 `.agents/skills` / `.claude/skills`。
- [ ] `description` 写"做什么 + 何时用",它决定自动触发质量。
- [ ] 不要依赖 Windsurf 不支持的 frontmatter 控制字段(不会生效);"仅手动触发"类需求请让用户走 `@name` 或改造成 Workflow。
- [ ] 企业分发:走系统级目录,并注意部署脚本/环境配置类资源放技能目录内。

## 5. 与标准基线差异速查

| 维度 | agentskills.io 基线 | Windsurf |
|---|---|---|
| 基础格式 | name+description | Devin CLI skills 格式;同样只需 name+description |
| 显式调用 | 产品层 | `@skill-name` |
| 资源支持 | 目录惯例 | 同目录支撑文件,调用时可用 |
| 其他机制 | — | Skills / Rules / Workflows 三分;Workflows 面向手动触发 |
| 企业层 | — | 系统级只读目录(三平台路径) |
