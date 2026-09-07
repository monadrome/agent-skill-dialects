# Roo Code(VS Code 扩展)

> 核对日期:2026-09-07
> 官方来源:https://roocodeinc.github.io/Roo-Code/features/skills/
> 定位:"标准 + **调度语义**"派:在 `.roo/skills` 与 `.agents/skills` 之上叠加**四层同名覆盖链**与**按 mode 生效的目录后缀**(`skills-{mode}`),名称校验严格、无 alias。

---

## 1. 目录与作用域

| 层级 | 位置(优先级自上而下递增,见 §2) |
|---|---|
| 全局 · Roo 专用 | `~/.roo/skills/{name}/SKILL.md`(Windows:`%USERPROFILE%\.roo\skills\`) |
| 全局 · 跨 agent | `~/.agents/skills/{name}/SKILL.md` |
| 项目 · Roo 专用 | `<project-root>/.roo/skills/{name}/SKILL.md` |
| 项目 · 跨 agent | `<project-root>/.agents/skills/{name}/SKILL.md` |

- Roo 专用 `.roo/` 与跨 agent `.agents/` 同层并存;`.roo/` 永远优先于同层 `.agents/`。
- **mode 专属目录**:同一批位置的变体 `skills-{mode}/`(mode slug 化)只在该 mode 下激活。例:`~/.roo/skills-code/` 仅 Code mode;`.roo/skills-architect/` 仅 Architect mode;`.agents/skills-{modeSlug}/` 同理。
- 适合:代码重构技巧只在 Code mode、架构模板只在 Architect mode、文档规范只在文档类 mode。
- 符号链接:支持(如 `ln -s /shared/company-skills ~/.roo/skills/company-standards`),name 须与链接名一致。

## 2. 同名覆盖优先级(高 → 低)

| 名次 | 位置 |
|---|---|
| 1 | 项目 `.roo/skills-{mode}/` |
| 2 | 项目 `.roo/skills/` |
| 3 | 项目 `.agents/skills-{mode}/` |
| 4 | 项目 `.agents/skills/` |
| 5 | 全局 `~/.roo/skills-{mode}/` |
| 6 | 全局 `~/.roo/skills/` |
| 7 | 全局 `~/.agents/skills-{mode}/` |
| 8 | 全局 `~/.agents/skills/` |

规律:Project > Global;Mode > Generic;同层 `.roo/` > `.agents/`。无 alias 机制,同名必须靠层级覆盖。

## 3. name/description 规则与加载

- `name` 字段**必须与目录名(或 symlink 名)完全一致**;1–64 字符,小写字母/数字/连字符;禁止首尾连字符、禁止连续连字符(`my--skill` 非法)。
- `name` 与 `description` 都必填;description 去空白后 1–1024 字符。
- **渐进披露三层**:
  1. Discovery:启动/索引只解析 frontmatter 的 name+description(内容不常驻);
  2. Instructions:请求匹配后 `read_file` 载入完整 SKILL.md;
  3. Resources:正文引用到的捆绑文件(scripts/templates/references)按需发现,无独立 manifest。
- 技能发现:启动时索引 + 文件监听器检测 SKILL.md 变更。
- 失效排查典型原因:description 太泛、mode 不匹配(Architect mode 下 `skills-code/` 的技能不加载)、同名冲突被上层覆盖、名称校验失败。

## 4. 适配清单

- [ ] 目录名 = `name` = 1–64 小写字母/数字/连字符,无首尾/连续连字符。
- [ ] 全局常用放 `~/.roo/skills/`;团队共享放 `<root>/.roo/skills/` 进仓库;跨 agent 走 `.agents/skills/`。
- [ ] 技能只属于特定 mode → 用 `skills-{mode}/` 目录,并把"不匹配就失效"写进正文提醒。
- [ ] 想覆盖团队通用技能 → 项目 `.roo/skills/` 同名即可,不用 alias。
- [ ] description 具体(动词开头 + 触发词 + 文件类型/工具/领域),否则匹配不上。

## 5. 与标准基线差异速查

| 维度 | agentskills.io 基线 | Roo Code |
|---|---|---|
| mode 绑定 | 无 | `skills-{mode}/` 目录后缀(独有) |
| 同名覆盖 | 未规定 | 8 级覆盖链:项目>全局、mode>generic、`.roo/`>`.agents/` |
| 名称校验 | 建议 | 严格:须等于目录名;无首尾/连续连字符 |
| alias | — | 不支持;同名靠覆盖链 |
| 加载 | 渐进披露 | 三层 + 启动索引 + 文件监听 |
| 捆绑资源 | 目录惯例 | 按需发现,无资源 manifest |
