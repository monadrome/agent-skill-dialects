# Continue(Continue CLI / Continue IDE)

> 核对日期:2026-09-07
> 官方来源:
> - CLI Agent Skills 实现(PR #9696):https://github.com/continuedev/continue/pull/9696
> - 官方 issue(需求与文档追踪):https://github.com/continuedev/continue/issues/11758
> - 官方主站/文档:https://docs.continue.dev
> 定位:"CLI 新功能、标准追随者":Continue CLI 新增内置 **Skills tool** 读取 `SKILL.md`(frontmatter name+description、正文=指令、同目录辅助文件暴露路径),完全对齐 agentskills 字段,未见独家 frontmatter 扩展。⚠️ 核对日官方 docs **尚无独立 Skills 页面**,本文以已合入的 PR #9696 为准,文档落位后需更新。

---

## 1. 目录与作用域

| 来源 | 目录 |
|---|---|
| 项目 | `<project>/.continue/skills/{skill}/SKILL.md` |
| 项目(兼容 Claude) | `<project>/.claude/skills/{skill}/SKILL.md` |
| 用户 | `$CONTINUE_HOME/skills/{skill}/SKILL.md` |

- 读取 `.claude/skills/` 是为了与其他 agent 共享已安装技能(复用既有生态)。
- 其余路径细节(项目/用户同名冲突如何取舍)官方 PR 未展开,谨慎依赖。

## 2. 文件格式与行为(以 PR #9696 为准)

- `SKILL.md` 头部 YAML frontmatter 含 `name` + `description`;Markdown 正文即技能指令。
- 同一文件夹内的辅助文件:工具的**返回结构会暴露其路径**(name/description/content/optional files),agent 再按需读取。
- 内置 **Skills tool**:列出可用技能、按名读取技能;未找到时返回明确错误。该工具注册在全部内置工具集中,任意会话可用。

## 3. 兼容性结论

- 未发现 Continue 专属 frontmatter 字段(无 type/flow、无 paths/triggers、无 allowed-tools 类控制);对 agentskills 标准文件,正文/字段兼容性预期良好。
- Continue IDE 自身的"Rules/指令"体系与 CLI Skills 是两套东西;本文只覆盖 CLI 侧 Agent Skills。
- 现状属于"官方实现先行、文档未跟上":建议以 PR 源码与 release notes 复核实际行为(见 README 维护约定)。

## 4. 适配清单

- [ ] 安装位置选 `.continue/skills/{skill}/SKILL.md`(项目)或 `$CONTINUE_HOME/skills/{skill}/SKILL.md`(用户);复用 Claude 生态可直接 `.claude/skills/`。
- [ ] frontmatter 只写 name+description;正文写清流程/边界/示例。
- [ ] 辅助脚本/长文档放同目录,SKILL.md 里说明"如需细节读取同目录 `xxx`"。
- [ ] 跨厂商移植时无需删除任何 Continue 专属字段(本来就没有)。
- [ ] 上生产前用 Continue CLI 直接问一句触发该技能,确认 Skills tool 能按名读到且返回结构正常。

## 5. 与标准基线差异速查

| 维度 | agentskills.io 基线 | Continue CLI |
|---|---|---|
| 目录 | 厂商命名空间 | `.continue/skills`、`.claude/skills`、`$CONTINUE_HOME/skills` |
| 必填字段 | name+description | 一致 |
| 厂商控制字段 | 无 | 未发现(忠实标准) |
| 读取入口 | 模型自行发现 | 内置 Skills tool(列表/按名读,结构化返回) |
| 辅助文件 | 目录惯例 | 同目录文件路径被工具显式暴露 |
| 官方文档 | — | ⚠️ 尚无独立页面,以 PR #9696 为准 |
