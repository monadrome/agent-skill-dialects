# Anysphere Cursor

> 核对日期:2026-09-07
> 官方来源:https://cursor.com/docs/context/skills
> 定位:"标准 + UI/组织增强"派:frontmatter 扩展有 `icon`/`color`/`metadata`/`paths`/`disable-model-invocation`,并把技能升级为 **Custom Mode(徽章)全会话常驻**;递归嵌套目录官方声明**纯组织用途**,不是父子功能关系。

---

## 1. 目录扫描与作用域

| 位置 | 说明 |
|---|---|
| `.cursor/skills/<name>/SKILL.md` | 项目级 |
| `~/.cursor/skills/<name>/SKILL.md` | 个人全局 |
| `.agents/skills`、`~/.agents/skills` | 标准互操作目录 |
| 兼容目录 | 同时读 `.claude/skills`、`.codex/skills` 与用户级 `~/.claude`、`~/.codex` |

- **嵌套 category**:`<root>/skills/<category>/.../<name>/SKILL.md` 允许任意层级嵌套目录,但仅作组织(分组展示)用途;**技能身份 = 含 SKILL.md 的那个目录**,官方明确它不是功能父子/层级调用。
- **monorepo 内嵌套 `.cursor/skills`**:子包里的技能按所在目录自动限定作用范围(类似 Claude 的目录限定,但实现为 scope 约束,命中目录内文件才候选);目录结构本身承担了"scope",类似路径门控但不需写 `paths`。
- Cloud Agents 同步:**仅** `~/.cursor/skills` 的个人技能会同步到云端 Agents。
- 分发:Skills Marketplace(市场分发技能包)。

## 2. frontmatter 字段

| 字段 | 规则 / 行为 |
|---|---|
| `name` | **必填**:仅小写字母/数字/连字符;**必须与父目录名完全相同**,否则技能不生效 |
| `description` | **必填**:触发匹配依据;写清"做什么 + 何时用" |
| `paths` | glob(逗号分隔字符串或 list),限定自动触发的文件范围 |
| `disable-model-invocation` | 默认 `false`;`true` = 仅手动调用 |
| `icon` | Custom Badge 图标,如 `beaker`/`code`/`rocket`;未知值回退 lightning(默认徽章) |
| `color` | Custom Badge 颜色 |
| `metadata` | 自由元数据 |

- 兼容旧字段 `globs`(旧版遗留,仍接受);**新技能一律写 `paths`**。

## 3. 调用与运行形态

- 显式:`/name`;`@name` 在输入框选用。
- 自动:模型按 description(+paths 门控)触发;`disable-model-invocation: true` 关闭自动。
- **Custom Mode(独有玩法)**:技能在面板里 `Alt+Enter` 可设为"Custom Mode",变成带徽章(可配 icon/color)的常驻模式,后续请求默认携带该技能,整场会话有效——这是把"技能"升格为"会话人格"的用法。
- 内置技能约 19 个,包括 `/create-skill`(向导建技能)、`/migrate-to-skills`(把旧 rules 迁移为技能)等。

## 4. 适配清单(把通用技能适配到 Cursor)

- [ ] `name` 小写字母数字连字符,且**目录名与 `name` 完全一致**——Cursor 校验严格,不一致直接不加载(与 Kimi/Copilot 类似)。
- [ ] `description` 必填;关键词前置。
- [ ] 需要限定自动触发文件范围 → `paths` glob;旧项目里若残留 `globs`,建议改成 `paths`。
- [ ] "仅手动"→ `disable-model-invocation: true`(注意 Cursor 没有 `user-invocable`,别依赖)。
- [ ] 想以徽章常驻 → 装好后设成 Custom Mode 并配 `icon`/`color`;未知 icon 值回退 lightning,不会报错。
- [ ] 组织/分组:用嵌套 category 目录;不要期待嵌套产生 Kimi `has-sub-skill` 式的父子调用语义。
- [ ] 安装:拷到 `.cursor/skills/`、`~/.cursor/skills/` 或任一兼容目录;要用 Cloud Agents 必须放 `~/.cursor/skills`。

## 5. 与标准基线差异速查

| 维度 | agentskills.io 基线 | Cursor |
|---|---|---|
| `name` 校验 | 建议 | 小写字母数字连字符且**必须等于目录名**,否则不加载 |
| UI 元数据 | 无 | `icon`/`color`/`metadata`(Custom Badge) |
| 路径门控 | 无 | `paths`(旧 `globs`) |
| 会话形态 | 无 | 技能可升格 Custom Mode 全会话常驻(独有) |
| 嵌套目录 | 无 | category 纯组织;monorepo 嵌套按目录 scope |
| 内置管理 | — | `/create-skill`、`/migrate-to-skills` 等约 19 个 |
| 分发 | 复制目录 | Skills Marketplace;Cloud Agents 同步(仅 `~/.cursor/skills`) |
