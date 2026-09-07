# Alibaba Qwen Code

> 核对日期:2026-09-07
> 官方来源:https://qwenlm.github.io/qwen-code-docs/en/users/features/skills/
> 定位:"标准 + 调度语义"派:保留 `name`/`description` 核心,扩展集中在**触发控制**(`paths` 文件门控、`priority` 排序、双向调用开关)与**技能生命周期管理**(`/learn`、`/curator`)。

---

## 1. 目录扫描与作用域

| 优先级 | 位置 | 说明 |
|---|---|---|
| 项目 | `.qwen/skills/<name>/SKILL.md` | 仓库内 |
| 个人 | `~/.qwen/skills/<name>/SKILL.md` | 跨仓库 |
| 扩展 | 扩展清单(`qwen-extension.json` 的 `skills` 字段声明) | 第三方扩展随带 |
| 内置 | 随 Qwen Code | 如 `skill-creator` |

- **实时刷新**:目录里增删改技能即时可见,无需重启。
- 兼容外部目录:同时读取 `.agents/skills`、`.claude/skills`(实测软链到 `~/.agents` 亦可)。
- 调试:用 `qwen --debug` 看扫描/解析日志。

## 2. frontmatter:标准字段的行为(严校验)

| 字段 | 规则 | 非法值处理 |
|---|---|---|
| `name` | **必填**;须匹配 `/^[\p{L}\p{N}_:.-]+$/u`(Unicode 字母/数字/下划线/冒号/点/连字符) | **解析期拒绝**,技能不加载 |
| `description` | 必填、非空 | 空则技能不可用 |
| `priority` | 可选;数字 | 非法值按 `0` 处理;`/skills` 列表里**数值高者排前**;但 `/` 补全仍按字母序 |
| `user-invocable` | 默认 `true` | `false` → 从 `/name` 与 `/skills` 列表隐藏,模型仍可触发 |
| `disable-model-invocation` | 默认 `false` | `true` → 模型不可自动触发,用户仍可 `/name` |
| `paths` | glob 列表/字符串 | 见 §3 |

- 两个开关**可叠加**:`user-invocable: false` + `disable-model-invocation: true` = 双方都不可达(仅作为归档/占位)。
- 注意语义相反:`user-invocable: false` 只管用户显式调用;**模型仍可触发**;要"仅手动"应使用 `disable-model-invocation: true`。

## 3. `paths` 文件门控(相对独特)

- 取值:逗号分隔字符串或 YAML list,glob 用 **picomatch**,模式**相对项目根**(如 `**/*.rs`)。
- 生效边界:**只影响模型的 SkillTool 自动选择**——只有当前工作文件匹配 `paths` 时,该技能才出现在模型的候选列表里。
- 用户 `/name` 直接调用**不受限**(路径不匹配也能跑)。
- 与 `disable-model-invocation: true` 组合时,paths 门控对该技能无意义(模型本就不触发)。
- 会话级:一旦在某个文件上触发匹配,**整个会话内该技能保持激活**,不随文件切换反复开关。

## 4. 生命周期扩展(独有)

**`/learn` — 把素材蒸馏成技能**

- 输入:URL、本地项目目录、或视频文件(`mp4`/`webm`/`mov`/`m4v`)。
- 产出:`~/.qwen/skills/learned-skill-<name>/SKILL.md`,并打标记 `source: learned`。

**`/curator []` — 技能档案管理员**

- 命令:`/curator list`、`pin`/`unpin`、`restore`、`run`、`dry-run` 等,统一维护技能创建/更新/归档。
- **auto-skill** 生命周期:闲置 30 天标记 stale;90 天后移到 `~/.qwen/archived-skills/`。
- 仅 `source: auto-skill` 的技能归 curator 管;`learned` 等来源不受影响。
- curator 的 trusted-workspace 检查约每 7 天一次,需在可信工作区才能执行维护。

## 5. 适配清单(把通用技能适配到 Qwen Code)

- [ ] `name` 字符集放宽(允许 Unicode、`_ : . -`),但仍建议小写 ASCII+连字符以便跨厂商;**非法字符会被解析期拒绝**,移植后务必先启动验证。
- [ ] `description` 必填且非空。
- [ ] 技能只该在特定文件类型上自动触发 → 加 `paths`(glob 相对项目根);注意它挡不住用户手动 `/name`。
- [ ] "仅手动执行"(命令式副作用)→ `disable-model-invocation: true`;"仅作背景知识、不让用户直接调"→ `user-invocable: false`。
- [ ] 想让技能在 `/skills` 列表置顶 → `priority` 给较大数字;别依赖它改变 `/` 补全顺序(仍字母序)。
- [ ] 校验:放 `.qwen/skills/` 或 `.agents/skills`/`.claude/skills`(兼容目录),改动即时生效;`qwen --debug` 看是否被解析期拒绝。

## 6. 与标准基线差异速查

| 维度 | agentskills.io 基线 | Qwen Code |
|---|---|---|
| `name` 校验 | 小写 ASCII 建议 | Unicode 集合 + 非法即拒 |
| 文件门控 | 无 | `paths` glob(仅限模型自动选择) |
| 排序 | 未规定 | `priority` 数值(仅 `/skills` 列表) |
| 双向调用开关 | 无 | `user-invocable` + `disable-model-invocation`(可叠加) |
| 生命周期 | 无 | `/learn`、`/curator`、auto-skill 30/90 天归档 |
| 兼容外部目录 | — | 读 `.agents/skills`、`.claude/skills` |
