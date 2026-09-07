# Aider(终端结对编程 AI)

> 核对日期:2026-09-07
> 官方来源:https://aider.chat/docs/usage/conventions.html(conventions / 提示文件约定)
> 定位:"无原生 SKILL.md 支持":核对日未发现 Aider 官方实现或文档声明支持 agentskills SKILL.md。其机制是 **CONVENTIONS.md + `.aider.conf.yml` 常驻注入 + 会话内 `/read`**,与"按需技能"哲学相反(无渐进披露概念)。跨厂商技能要落到 Aider,只能走**桥接迁移**,不能原样安装。

---

## 1. 现状结论

- Aider 没有等价于 `<skills-root>/{name}/SKILL.md` 的扫描目录,也没有 `name`/`description` 匹配触发机制。
- 它面向"始终在上下文里的规则/提示"与"会话中临时 `/read` 的文件",属**全量注入**,不是渐进披露。
- 第三方做法(社区桥接,非官方):把技能正文并入 `CONVENTIONS.md`,或通过 `.aider.conf.yml` 的 `read:` 列表常驻引用。

## 2. Aider 原生机制(迁移目标)

| 机制 | 位置/语法 | 行为 |
|---|---|---|
| 仓库约定文件 | `CONVENTIONS.md`(仓库根) | 每会话自动读入上下文,写代码规范/约束 |
| 配置文件注入 | `.aider.conf.yml` 中 `read: CONVENTIONS.md`(可多文件) | 让指定提示文件常驻;等价的还有启动参数 `--read` |
| 会话内按需读 | 对话中 `/read <path>` | 临时把某文件内容加入上下文 |
| 提交信息/消息模板等 | `--message-file`、`--prompt` | 一次性注入,不适用技能复用 |

- 官方建议 CONVENTIONS.md 保持简短;这正好与 SKILL.md "一个技能 ≤5k tokens、长内容拆 references" 的取向不同——Aider 无按需加载层。

## 3. 迁移路径(把一份通用 SKILL.md 落到 Aider)

1. **按技能拆分文件**:把每个技能正文存为独立 Markdown,例如仓库 `conventions/api-style.md`,顶部不用 frontmatter(Aider 不解析)。
2. **高频/强约束技能** → 合并要点进 `CONVENTIONS.md`(注意总量,避免上下文膨胀)。
3. **低频/长技能** → 放仓库,在 `CONVENTIONS.md` 或对话里提示"做 X 前先 `/read conventions/api-style.md`";或加进 `.aider.conf.yml` 的 `read:`。
4. **保留一份 SKILL.md 主源**:Aider 侧文件由 SKILL.md 生成/同步,避免双份维护漂移(如用脚本把 frontmatter 剥掉生成 conventions 文件)。

## 4. 适配清单

- [ ] 确认 Aider 无原生技能目录后,别再按"安装到某目录"思路做,改为"生成/同步 conventions 文件"。
- [ ] 强约束规则合并进 `CONVENTIONS.md`,总量控制在 Aider 可承受的常驻上下文内。
- [ ] 长/低频内容用 `read:` 常驻引用或会话内 `/read`,别全部塞进 CONVENTIONS.md。
- [ ] 仓库内保留 SKILL.md 作为可移植主源,并写清"针对 Aider 的同步产物"在哪个目录,避免两处失同步。
- [ ] 若未来 Aider 官方支持 Agent Skills,本文需整体改写(见 README 维护约定:关注官方 conventions 页变更)。

## 5. 与标准基线差异速查

| 维度 | agentskills.io 基线 | Aider |
|---|---|---|
| 技能目录 | `<name>/SKILL.md` | ❌ 无;用 CONVENTIONS.md / read 列表 |
| 必填 frontmatter | name+description | ❌ 不解析任何 frontmatter |
| 触发/匹配 | 按 description 渐进加载 | ❌ 无匹配机制;全量常驻或手动 /read |
| 辅助文件 | 按需读取 | `/read` 手动拉取 |
| 平台野心 | 跨厂商互操作 | 无互操作面;SKILL.md 生态迁移需桥接 |
