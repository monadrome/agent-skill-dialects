# Moonshot Kimi Code CLI

> 核对日期:2026-09-07
> 官方来源:
> - 新版文档:https://www.kimi.com/code/docs/en/kimi-code-cli/customization/skills.html
> - 旧版文档:https://www.kimi-cli.com/en/customization/skills.html(部分内容已过时,注意下方版本差异)
> 定位:实现最"重"的厂商之一——目录/扁平双形态、camelCase frontmatter、`type: flow` 运行编排、`has-sub-skill` 父子层级均为 Kimi Code 独有扩展。

> ⚠️ 两版文档并存:新文档以 `~/.kimi-code/` 为用户目录,旧文档以 `~/.kimi/` 为用户目录。下文默认以**新版为准**,与旧版冲突处单独标注。

---

## 1. 目录扫描与作用域

| 优先级(高→低) | 目录 | 说明 |
|---|---|---|
| Project | `<repo>/.kimi-code/skills` → `<repo>/.agents/skills` | 跟随项目;`.agents/skills` 与其他厂商互操作 |
| User | `$KIMI_CODE_HOME/skills`(默认 `~/.kimi-code/skills`) → `~/.agents/skills` | `$KIMI_CODE_HOME` 默认即 `~/.kimi-code`(旧版 `~/.kimi`) |
| Extra | `extra_skill_dirs` 配置或 `--skills-dir <dir>` | 覆盖/追加外部技能目录 |
| Builtin | 随 CLI 内置 | 如 `kimi-cli-help`、`skill-creator`、`sub-skill` |

- **同名冲突**:更具体/更近的 scope 覆盖更远的(Project > User > Extra/Builtin 这一维度按实现取其一,官方描述是"更具体的优先")。
- **旧版行为差异**:旧文档按"品牌组"读取——kimi/claude/codex 三组 + 通用组(如 `~/.config/agents/skills`);新版默认 `merge_all_available_skills = true`,即一次合并读取 `.kimi-code`、`.claude`、`.codex`、`.agents` 等品牌目录下的 skills,而不是只认自家目录。
- 名称**大小写不敏感**即可被识别,展示时统一转小写。

### 形态与解析规则

**目录形态(推荐)**:`<skills-root>/<name>/SKILL.md`
- 目录内必须有 `SKILL.md`;**目录形态下 `name` 与 `description` 都必须齐全**,否则整个技能解析失败(parse fail)。
- 目录名作为技能名。

**扁平 `.md` 形态**(旧版兼容):`<skills-root>/<name>.md`
- 技能名取文件名;`description` 取正文首行非空文本,截断到 240 字符;若首行缺失/为空则记为 `"No description provided."`。

---

## 2. frontmatter 标准字段与厂商字段

> 注意命名风格:Kimi 文档主推 **camelCase**(`whenToUse`、`disableModelInvocation`),同时接受 kebab/snake 别名。跨厂商移植时 kebab-case 在多数厂商通用,但在 Kimi 请显式给出 camelCase 或用其别名。

| 字段 | 默认 | Kimi 行为 |
|---|---|---|
| `name` | 目录名/文件名 | 展示名;目录形态必填(缺失→解析失败);扁平形态不用写 |
| `description` | 扁平形态取首行 | 目录形态必填(缺失→解析失败);与 `whenToUse` 一起用于模型判断 |
| `type` | `prompt` | 取值见下;**未知/非法取值导致整个技能被跳过**(不是报错、不是按默认处理)——这是 Kimi 与其他厂商最大的兼容坑 |
| `whenToUse` | 无 | 追加的触发场景描述;别名 `when-to-use` / `when_to_use` |
| `disableModelInvocation` | `false` | `true` = 仅手动(`/skill:`),模型不得自动触发;别名 `disable-model-invocation` / `disable_model_invocation` |
| `arguments` | 无 | 命名参数:YAML 数组或空格分隔字符串;正文用 `$<name>` 引用 |
| `has-sub-skill` | `false` | 见 §5 子技能;也可放在 `metadata:` 内(`has-sub-skill` / `hasSubSkill`) |

### `type` 取值语义(核心差异)

| 取值 | 含义 | 说明 |
|---|---|---|
| `prompt`(默认) | 普通指令技能 | 手动 `/skill:<name>` 与模型自动触发均可 |
| `inline` | 等价于 `prompt` | Kimi 显式声明与 prompt 相同,仅写给人读 |
| `flow` | 流程图编排技能 | 见 §4;只能通过 `/flow:<name>` 以流程方式执行,`/skill:<name>` 只会按普通 prompt 加载 |
| 其他任意值 | **整个技能被跳过** | 不加载、不出现、不报错。跨厂商迁移时若残留 Qwen/Cursor 的 `type` 扩展值(如别的语义)务必删除 |

---

## 3. 正文占位符与参数传递

调用 `/skill:<name> [参数文本]` 后,正文按以下优先级做参数替换:

| 占位符 | 语义 |
|---|---|
| `$ARGUMENTS` | 完整参数文本(整段) |
| `$ARGUMENTS[N]` | 第 N 段参数(POSIX 词法切分,支持引号) |
| `$N` | 等价简写(如 `$1`) |
| `$<name>` | `arguments` 里声明的命名参数,按声明顺序映射到位置 |
| `${KIMI_SKILL_DIR}` | 技能所在目录绝对路径(用于引用同目录脚本/资源) |

- **无任何占位符时**:调用方把参数以 `\n\nARGUMENTS: <text>` 附加在正文末尾,技能内通过该段自行解析。
- **引号规则**:采用 POSIX 风格词法,`"fix login"` 是一个参数;未加引号的空格是分隔符。
- 参数替换在**整段正文与代码块内**都生效;若需字面 `$` 请确认转义规则后再用(不同版本实现有差异,以官方文档为准)。

示例:

```yaml
---
name: make-commit
description: 按指定规范生成 commit message。当用户说"生成 commit"时使用。
arguments: [scope, message]
---
请生成一个遵循 conventional commits 的提交信息,scope=`$1`,内容=`$message`。
若调用方还传了额外上下文,它会在: `$ARGUMENTS`
```

---

## 4. Flow 技能(`type: flow`)— Kimi 独有

Flow 用 Mermaid 或 D2 图描述"有分支、可中断、需用户确认"的流程,由 Kimi 逐步引导执行,而不是把整段指令一次灌给模型。

````markdown
---
name: release-flow
description: 发布流程:构建、测试、灰度、上线各阶段。
type: flow
---
```mermaid
flowchart TD
  BEGIN[开始: 检查分支与 CI] --> B{测试是否通过}
  B -- 是 --> C[打 tag 并推送]
  B -- 否 --> D[修复并重跑测试]
  D --> B
  C --> E[灰度发布 10%]
  E --> F{观察 30 分钟}
  F -- 正常 --> G[全量发布]
  F -- 异常 --> H[回滚]
  G --> END[结束: 更新 changelog]
  H --> END
````

- 流程图必须能识别出唯一的起点与终点(官方约定为 **BEGIN 与 END** 语义);缺失或多余会被校验拒绝。示例仅演示语法,字段细节以官方文档为准。
- 图内**分支(决策)节点**:执行到该节点时,模型必须输出形如 `<choice>是</choice>` / `<choice>否</choice>` 的选择,引导用户确认后继续,避免模型擅自替用户做关键决策。
- 调用方式:`/flow:<name>` 自动按图逐步执行;`/skill:<name>` 只会把该技能当普通 prompt 加载,不会触发流程引擎。
- D2 格式亦受支持;多行 label 用 `|md` 语法。
- 层级上限:嵌套调用不超过 3 层。

---

## 5. 子技能 / 父-子层级(`has-sub-skill`)— Kimi CLI 独有聚合语义

> 这正是触发本次调研的特性。结论:**它不是 agentskills.io 标准的一部分,也不是 Claude/Cursor/Qwen 的层级语义**。Kimi 的实现是"目录聚合 + 自动限定命名"。

目录结构:

```
~/.kimi-code/skills/my-kit/
├── SKILL.md            # 父技能;frontmatter 含 has-sub-skill: true
├── setup/
│   └── SKILL.md        # 子技能:被自动重命名为 my-kit.setup
└── teardown/
    └── SKILL.md        # 子技能:my-kit.teardown
```

- 父 `SKILL.md` 声明 `has-sub-skill: true`(或 `metadata.has-sub-skill` / `metadata.hasSubSkill`,源码键大小写不敏感)。
- 放在**父技能目录内**的子目录 SKILL.md 会被发现,并自动限定命名为 `<parent>.<child>`(源码中即 `qualifySubSkillName` 逻辑),于是 `/skill:my-kit.setup` 只能在这个限定名下命中。
- Kimi 内置的 `sub-skill` 即此形态:父 `sub-skill`(`has-sub-skill: true`)+ 子 `sub-skill.review`、`sub-skill.consolidate`,子技能均为 `disable-model-invocation: true`(只允许被编排调用)。
- 版本演进:0.11.0 实验性发现 → 0.12.0 稳定 → 0.14.2 子技能限定命名(版本节点未逐字核对官方文档,待复核)。
- 移植提示:其他厂商没有"父目录里发现子技能目录并自动改名"的机制——Claude 的 `apps/web:deploy` 是**加载时目录限定命名空间**,Cursor 嵌套目录官方声明**纯组织用途**,均无 Kimi 的父包聚合语义。通用技能想保留父子关系,请自行用命名前缀(`parent.child`)并把子技能装到各厂商自己识别的层级中。

---

## 6. 调用机制

| 方式 | 语法 | 说明 |
|---|---|---|
| 手动(显式) | `/skill:<name> [参数]` | 参数按 §3 规则传递;嵌套技能用点号全名 `/skill:my-kit.setup` |
| 流程(显式) | `/flow:<name>` | 仅 `type: flow`;按图逐步执行 |
| 自动(隐式) | 模型读 `description` + `whenToUse` 自行触发 | `type: flow` 或 `disableModelInvocation: true` 的技能不参与自动触发 |
| 层级上限 | — | 技能嵌套调用最多 3 层 |

## 7. 内置技能与配置

- 内置:`kimi-cli-help`、`skill-creator`(建技能向导)、`sub-skill`(父子编排示例,见 §5)。
- 相关配置:
  - `merge_all_available_skills`(默认 `true`):是否合并读取各品牌目录下的技能。
  - `extra_skill_dirs` / `--skills-dir`:追加技能目录(Extra scope)。
- 调试:启动参数加日志级别查看技能扫描与解析结果;技能被跳过时先看 frontmatter 是否含非法 `type` 值、目录形态是否缺 `name`/`description`。

## 8. 分发 / 安装

- 目录形态:把 `<name>/SKILL.md`(含资源)拷入任一扫描目录即可,如 `~/.kimi-code/skills/<name>/`、项目 `.kimi-code/skills/<name>/`。
- 扁平形态:`.md` 直接放入技能目录(旧版兼容)。
- 无插件/市场体系(对比 Claude plugin、Codex plugin/ChatGPT、Cursor Marketplace)。

---

## 9. 适配清单(把通用技能适配到 Kimi Code)

把一份面向 agentskills.io 的通用技能接入 Kimi Code 时,逐条核对:

- [ ] 目录名与 `name` 均为小写;目录内 SKILL.md 同时含 `name` 与 `description`,缺一不可。
- [ ] 检查 frontmatter 是否残留其他厂商的 `type` 取值——Kimi 只认 `prompt` / `inline` / `flow`,**其余取值会把整个技能静默跳过**。
- [ ] 需要禁用模型自动调用:写 `disableModelInvocation: true`(camelCase)或 `disable-model-invocation: true`。
- [ ] 触发场景补充:写 `whenToUse`(或 `when-to-use`)。
- [ ] 命名参数:声明 `arguments: [a, b]` 后,正文只写 `$a` / `$b` / `$ARGUMENTS[N]` / `$N`,不要依赖 Claude 的 `$name` 之外的非标准行为。
- [ ] 正文想"附带整段参数文本"就显式写 `$ARGUMENTS`,否则 Kimi 会以 `ARGUMENTS:` 段尾附追加——注意这与部分厂商"无占位符即忽略参数"不同,可能污染正文。
- [ ] 引用同目录资源用 `${KIMI_SKILL_DIR}/scripts/xxx.py` 相对展开(Claude 用 `${CLAUDE_SKILL_DIR}`,跨厂商注意替换)。
- [ ] 需要"必须人工决策的分支"才上 `type: flow` + Mermaid/D2;普通技能不要用 flow,否则只能 `/flow:` 执行且无法被模型自动触发。
- [ ] 父子结构:确认你的预期是 Kimi 的"父目录聚合自动改名"。Claude/Cursor 用户不会得到同款行为,不要在主技能里依赖它。
- [ ] 校验:启动后 `/skills`(或等价列表)应能看到技能;看不到时按 §7 调试线索排查"被跳过"原因。

## 10. 与标准基线差异速查

| 维度 | agentskills.io 基线 | Kimi Code |
|---|---|---|
| 必填 | `name`+`description`(建议) | 目录形态强制二者齐全,否则解析失败;扁平形态可从首行推导 |
| 显式调用 | 产品层未规定 | `/skill:<name>`(普通)、`/flow:<name>`(流程) |
| 字段命名风格 | kebab-case 通行 | 文档主推 camelCase,接受 kebab/snake 别名 |
| 非法 frontmatter | 未规定 | 非法 `type` 值 → 整技能跳过 |
| 自动调用开关 | — | `disableModelInvocation` / `whenToUse` 体系 |
| 父子层级 | 无 | `has-sub-skill` 目录聚合 + 自动限定命名(独有) |
| 运行编排 | 无 | `type: flow`(Mermaid/D2,独有) |
| 参数占位符 | — | `$ARGUMENTS` / `$ARGUMENTS[N]` / `$N` / `$<name>`;无占位符时尾附 `ARGUMENTS:` |
| 目录品牌合并 | — | `merge_all_available_skills` 一次读 kimi/claude/codex/agents 等 |
| 支持形态 | 目录 | 目录 + 扁平 `.md`(旧版兼容) |
