# OpenHands(开源 AI 编码代理)

> 核对日期:2026-09-07
> 官方来源:
> - 总览:https://docs.openhands.dev/overview/skills
> - 关键词触发:https://docs.openhands.dev/overview/skills/keyword
> - 路径触发规则:https://docs.openhands.dev/overview/skills/path
> - 官方技能注册表:https://github.com/OpenHands/extensions
> 定位:"标准 + **自动触发**"派:完整支持 Agent Skills 规范,唯一两家在 frontmatter 中定义"自动注入"机制(`triggers:` 关键词 / `paths:` 路径门控)并把技能从"模型可选"变成"确定性下发"的厂商(另一家是 Qwen)。OpenHands 自身文档明说:"Other Agent Skills clients may ignore these OpenHands extensions."

---

## 1. 目录与作用域

| 层级 | 推荐位置 | 说明 |
|---|---|---|
| 项目(仓库内) | `<project>/.agents/skills/{name}/SKILL.md` | 跟随项目,跨 agent 可移植 |
| 用户(全局) | `~/.agents/skills/{name}/SKILL.md` | 该用户所有会话 |
| 公开(registry) | `github.com/OpenHands/extensions` | 配置为加载官方公共注册表的会话可用 |
| 仓库上下文 | `<repository>/AGENTS.md` | 全量进初始系统提示词(不属于技能,但易混淆) |

- **legacy 兼容**:`.openhands/skills/` 与 `.openhands/microagents/` 仍被支持,但官方明确新技能一律用 `.agents/skills/`(遵循 Agent Skills 标准、可跨工具移植)。
- 另外识别 `CLAUDE.md`、`GEMINI.md` 作为模型专属仓库上下文。
- 路径触发规则与普通技能从**同一批目录**加载。

## 2. 同名覆盖优先级(高 → 低)

| 名次 | 来源 |
|---|---|
| 1 | SDK 显式传入的 Skill(覆盖自动加载) |
| 2 | 项目技能(从会话 workspace 解析,覆盖同名其他来源) |
| 3 | 用户技能 |
| 4 | 公共注册表技能 |

- 同名**不合并正文,直接整体覆盖**。
- 同一 scope 内 `.agents/skills/` 优先于 legacy 目录(`.openhands/skills/` 等)。
- Agent Canvas 技能目录默认是"推荐技能 allow-list",默认只启用带 Recommended 徽标的技能;deny-list 优先级高于 allow-list。

## 3. frontmatter 与 OpenHands 专有扩展

### 标准字段
- `name` + `description` **必填**;`name` 必须等于父目录名,只用小写字母/数字/连字符(见官方 Creating Skills 页)。

### 专有扩展(本文核心差异)

| 字段 | 语义 | 与"普通技能"的区别 |
|---|---|---|
| `triggers:`(YAML list) | 用户消息命中任一关键词/命令时,把技能正文**注入**上下文 | 技能**仍保留在技能目录、仍可被模型主动调用**;未命中时零成本 |
| `paths:`(YAML list 或逗号分隔字符串) | 变成 **path-triggered rule(路径触发规则)** | **不进 `<available_skills>`,模型无法主动调用**;命中文件被读/改/建时注入 `<EXTRA_INFO>` 块,同一规则每会话只注入一次 |

- **两者同时声明时 `paths:` 获胜**,文件退化为纯规则,保持确定性、不进入模型可调用目录。
- 官方定位:path rules ≈ Claude Code "rules" —— 对作用域内文件**保证加载**,不依赖模型自觉选择。

### `paths` glob 语义(gitignore 风格,针对 workspace 相对 POSIX 路径)

| 模式 | 匹配 |
|---|---|
| `**` | 任意层路径段(含 0 层,可跨 `/`) |
| `*` | 单个路径段内的任意字符(**不跨** `/`) |
| `?` | 单个非分隔符字符 |
| `*.ts`(无斜杠) | 任意深度的同名 basename,等价 `**/*.ts` |
| 大小写敏感 | 默认区分大小写 |
| 点文件 | `*` 也匹配前导点文件(`src/*` 能匹配 `src/.env`) |

- **repo-scoped**:触碰 workspace 之外的文件不会触发规则。
- ACP 支持的会话**不注入** path rules(ACP server 拥有工具执行权)。

### 扁平 `.md` 技能(OpenHands 支持)
- `.agents/skills/api-validation.md` 这类**扁平文件**也可作为技能,官方示例即用于 path rules。
- 遗留行为:**无 trigger 的旧式扁平 `.md` 技能会被全量加载**(占上下文),官方建议改用 AGENTS.md。

## 4. 加载与调用机制

- 渐进披露三层:Discovery(只载 name+description 进 available-skills 目录)→ Invocation(任务匹配后按名载入完整 SKILL.md)→ Resources(按需读 `scripts/` `references/` `assets/`)。
- `triggers` 命中与 path rule 命中都是"把内容注入工具结果/上下文",不是重新唤起一个 agent。
- **修改 SKILL.md 后须新开对话**,OpenHands 才会重建 available-skills 目录。
- 分发表面差异:Agent Canvas 在 Customize > Skills 管理并开关;SDK/agent server 直接传 Skill 对象或启用 loader;Cloud 可对会话导入/选择技能(含 Git 仓库中的技能)。

## 5. 适配清单

- [ ] 跨厂商通用技能放 `<project>/.agents/skills/{name}/` 或 `~/.agents/skills/{name}/`,目录名 = `name` = 小写字母/数字/连字符。
- [ ] 只写 `name`+`description`+正文,即得到标准行为(模型按 description 自动调用)。
- [ ] 想"提到关键词就自动给规则" → 加 `triggers:`;想要"永不靠模型自觉"的确定性规则 → 用 `paths:` + 扁平 `.md` 或普通目录都行。
- [ ] 迁移旧 `.openhands/microagents/` 技能 → 转成 `.agents/skills/{name}/SKILL.md`;旧扁平无 trigger 技能 → 转 AGENTS.md 或加 trigger。
- [ ] 千万别依赖"同名自动合并"(不合并,直接覆盖)。
- [ ] 改了 SKILL.md 记得开新会话验证,否则目录还是旧的。

## 6. 与标准基线差异速查

| 维度 | agentskills.io 基线 | OpenHands |
|---|---|---|
| 自动注入字段 | 无 | `triggers:`(仍可被模型调)与 `paths:`(规则化,不可被模型调) |
| `paths`/`triggers` 冲突 | 未规定 | `paths:` 获胜 |
| 扁平 `.md` | 规范只讲目录形态 | 支持扁平文件;无 trigger 时全量加载(遗留) |
| 同名冲突 | 未规定 | 项目>用户>公共;SDK 显式最高;不合并直接覆盖 |
| 外部分发 | 复制目录 | 官方 registry + Cloud 从 Git 导入 |
| 仓库级常驻指令 | 无 | 识别 AGENTS.md / CLAUDE.md / GEMINI.md(独立于技能体系) |
