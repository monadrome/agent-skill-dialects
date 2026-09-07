# JetBrains Junie(IDE 内 Junie Agent + Junie CLI)

> 核对日期:2026-09-07
> 官方来源:
> - Junie 官方技能页:https://junie.jetbrains.com/docs/agent-skills.html(⚠️ 核对日直连返回 403,无法逐字抓取,关键行为以下方两条官方材料佐证)
> - JetBrains 官方博客(2026-03-25):https://blog.jetbrains.com/idea/2026/03/ai-assisted-java-application-development-with-agent-skills/
> - JetBrains Air Help · Skills(2026-08-14 更新):https://www.jetbrains.com/help/air/skills.html
> 定位:"标准采用者":按 agentskills.io 目录形态与必填字段实现,未见公开的独家 frontmatter 控制字段;差异主要体现在**双产品线目录**(Junie 本体 `.junie/skills`;JetBrains Air IDE 里 Junie 作为内置 agent 之一,额外共享 `.agents/skills`)与 **CLI 的 `/skills` 管理命令**。

---

## 1. 目录与作用域(需区分两个产品表面)

### Junie(独立 Agent / 独立 CLI)—— 官方博客表格

| 层级 | 目录 |
|---|---|
| 项目级 | `<project>/.junie/skills/{skill-name}/SKILL.md` |
| 用户级 | `~/.junie/skills/{skill-name}/SKILL.md` |

### JetBrains Air IDE —— Air Help 页
- 共享技能位于 `.agents/skills/{skill-name}/SKILL.md`,JetBrains Air 内**所有 agent 可用**。
- 除共享技能外,各 agent 支持专属目录:Claude Agent `.claude/skills/`、OpenAI Codex `.codex/skills/`、Gemini `.gemini/skills/`、**Junie `.junie/skills/`**。
- 不要混淆:JetBrains **Air** 是另一条产品线(内含 Claude/Codex/Gemini/Junie 多个 agent),Junie 文档与 Air 文档并存;技能结构一致,安装目录按产品线选择。

## 2. frontmatter 与技能格式

- 标准必填:`name` + `description`(目录形态 `<skill-name>/SKILL.md`,name 与目录名一致,小写字母/数字/连字符)。
- 可选标准字段:按 agentskills 规范含 `license`、`compatibility`、`metadata`(官方博客的示例 SKILL.md 即用了这三个)。
- 官方博客描述加载方式 = 标准的**渐进披露**:启动只读 name+description,任务匹配后才加载完整 SKILL.md。
- ⚠️ **信息精度**:Junie 官方技能页核对日 403,未取得其 frontmatter 字段表的逐字原文;上文按 agentskills 标准 + 官方博客/Air Help 佐证撰写,**若官方页有额外扩展字段,需复核补充**(见 README 维护约定)。

## 3. Junie CLI 行为(出处:上方 JetBrains 官方博客与 Air Help;CLI 专属出处待补,待复核)

- Junie CLI 是 LLM-agnostic 编码 agent;定制手段包含 guidelines、custom agents、**agent skills**、commands、MCP。
- CLI 提供 `/skills` 命令:查看发现的技能,并可**逐技能开启/关闭**;另含随 CLI 捆绑的 built-in skills。
- 仓库/用户指引仍走 AGENTS.md 体系(`.junie/AGENTS.md` + 项目根 `AGENTS.md`),与技能并存、各司其职。

## 4. 与标准基线差异速查

| 维度 | agentskills.io 基线 | Junie / JetBrains |
|---|---|---|
| 目录 | 各厂商命名空间 | Junie:`.junie/skills`、`~/.junie/skills`;Air 共享:`.agents/skills` |
| 必填字段 | name+description | 一致(可选字段按标准:license/compatibility/metadata) |
| 技能管理命令 | 无 | Junie CLI `/skills` 列示并可开关 |
| 内置技能 | 未涉及 | CLI 捆绑 built-in skills |
| 公开的独家 frontmatter | 无 | 未见(官方页 403,待复核) |
| 常驻仓库指引 | 无 | `.junie/AGENTS.md`、根 `AGENTS.md`(独立体系) |

## 5. 适配清单

- [ ] 想被 Junie Agent/CLI 识别 → 用 `.junie/skills/{name}/SKILL.md`(项目)或 `~/.junie/skills/{name}/SKILL.md`(用户)。
- [ ] 在 JetBrains Air 中跨 agent 共享 → 放 `.agents/skills/{name}/SKILL.md`(Claude/Codex/Gemini/Junie 都读)。
- [ ] frontmatter 只用 name+description,可选 license/compatibility/metadata;正文按标准 Markdown 指令写。
- [ ] 别把 Junie 专属目录与 Air 共享目录混用当"同一技能双实例"(同名不同目录是两份)。
- [ ] 发布前用 Junie CLI `/skills` 验证发现与开关状态。
- [ ] 复用官方 spring-data-jpa 类技能模式:正文给"原则 + 反例 + 正例",agent 会自动按任务加载并自行跑测试验证。
