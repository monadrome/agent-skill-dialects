# Anthropic Claude Code

> 核对日期:2026-09-07
> 官方来源:https://code.claude.com/docs/en/skills.md(文档本身即 .md,便于抓取)
> 定位:**开放标准的主导者**,但"标准之外"的扩展也最多(字段数全场第一)。Claude Code 全量字段只在 Claude Code 内有效;claude.ai 上传 / Skills API / 插件打包只放行标准六字段。

---

## 1. 目录扫描与作用域

| 优先级(高→低) | 位置 | 说明 |
|---|---|---|
| Enterprise | 托管/管理配置 | 组织统一下发,用户不可改 |
| Personal | `~/.claude/skills/<name>/SKILL.md` | 个人全部项目 |
| Project | `.claude/skills/<name>/SKILL.md` | 当前项目;向上到仓库根也认 |
| Plugin | `<plugin>/skills/<name>/SKILL.md` | 随插件启用 |
| Bundled | 内置 | 可用同名覆盖,但覆盖不了内置别名 |

**同名冲突规则**(与直觉相反,Personal 优先于 Project):

- 层级覆盖:Enterprise > Personal > Project > Bundled。例:`~/.claude/skills/deploy` 与项目 `.claude/skills/deploy` 同名时,`/deploy` 跑**个人版**。
- 项目技能可覆盖同名内置(如 `code-review`),但内置的别名(`/review`)仍指向内置,不会转到你的技能。
- 插件技能用 `plugin-name:skill-name` 命名空间,不与各层级冲突。
- `.claude/commands/*.md` 与技能并存;同名时技能优先。
- **嵌套项目技能**(monorepo):工作目录下的子目录 `.claude/skills/` 也会被发现。与上级同名时**两个都保留**:嵌套者以**目录限定名**呈现(如 `apps/web:deploy`,名称源自相对工作目录的子目录路径)。Claude 正在处理该目录下文件时自动倾向嵌套变体;`/deploy` 只跑根级技能,`/apps/web:deploy` 显式跑嵌套版。
- 顶层个人/项目技能支持 **symlink**,Claude Code 跟随链接读取目标;同一目标被多处可达时只加载一次。
- `synced` 目录名(任意大小写)在 enterprise/personal/project 层**保留**,用于存放 claude.ai 同步技能,勿自行占用。
- **实时检测**:新增/编辑/删除技能会立刻在当前会话生效;但如果"技能目录本身"在会话开始后才新建,需重启才能开始监听。

## 2. 解析与 frontmatter 通用规则

- frontmatter 必须从**文件第一行**开始(以 `---` 开头);否则整份文件(含 `---`)都按正文处理。
- 布尔字段除 `true`/`false` 外,接受 `yes`/`no`/`on`/`off`/`1`/`0`(任意大小写);v2.1.218 之前只认 `true`/`false`。
- 除 `description` 推荐外,**所有字段均可选**;`name` 省略时用目录名。
- `description` 省略时取正文首段。
- **命中提示**:技能列表里展示的是 `description` + `when_to_use` 的拼接文本,合计**截断到 1,536 字符**(可用 `skillListingMaxDescChars` 调);因此关键词务必前置。

## 3. frontmatter 字段全表

| 字段 | 默认 | 行为(Claude Code 内) |
|---|---|---|
| `name` | 目录名 | 展示名。个人/项目技能的命令名**仍来自目录名**,`name` 只改列表显示;插件技能中 `name` 决定命令末段(前缀为插件名) |
| `description` | 正文首段 | 触发匹配核心;与 `when_to_use` 合计 ≤1,536 字符 |
| `when_to_use` | — | 追加触发语境(触发词/示例请求),计入上面 1,536 上限 |
| `argument-hint` | — | 自动补全提示,如 `[issue-number] [format]` |
| `arguments` | — | 命名位置参数:空格分隔字符串或 YAML list;`$name` 按声明顺序映射到位置 |
| `disable-model-invocation` | `false` | `true`:仅用户可调(`/name`),模型不得自动触发;技能 description 不常驻上下文,用户触发时才载入 |
| `user-invocable` | `true` | `false`:从 `/` 菜单与 `/name` 调用中隐藏,仅模型可触发;description **始终**在上下文 |
| `allowed-tools` | — | 该技能被调用的**回合内**免确认授权工具(如 `Bash(git add *)`);下一轮消息即失效(不是整会话);不限制工具全集,未列出工具仍可调用、受全局权限约束 |
| `disallowed-tools` | — | 技能激活期间从工具池移除(如后台循环技能禁用 `AskUserQuestion`);同样一轮即失效;无法移除 `EndConversation` |
| `model` | 继承会话 | 技能激活当回合覆盖模型;被组织 allowlist 排除的值被忽略;`context: fork` 时设置子 agent 模型 |
| `effort` | 继承会话 | `low`/`medium`/`high`/`xhigh`/`max` |
| `context` | inline | `fork`:技能内容变成**子 agent 的任务提示**,在隔离上下文(无对话历史)中执行 |
| `agent` | `general-purpose` | 配 `context: fork`,指定子 agent 类型(内置 Explore/Plan 或 `.claude/agents/` 自定义) |
| `background` | `true` | 仅 `context: fork` 生效;`false` = 阻塞等待子 agent 结果(默认后台跑、完成后再汇入) |
| `hooks` | — | 技能被调用时注册、整会话有效的 hooks(格式同 hooks 配置,支持 `once`) |
| `paths` | — | glob 模式限流**自动触发**(只在工作文件匹配时自动加载);格式同 path-specific rules |
| `shell` | `bash` | 控制正文中动态命令注入用哪个 shell:`bash` 或 `powershell` |
| `metadata` | — | 自由 YAML map,仅供自家工具读取;Claude Code 不解释内容;值非 map 会被丢弃;勿复用 `paths` 等字段名做键 |
| `license` | — | agentskills.io 规范字段;Claude Code 接受但不动作 |
| `compatibility` | — | agentskills.io 规范字段(≤500 字符);Claude Code 接受但不动作 |

### 标准立场(claude.ai / Skills API / 插件打包路径)

- 只放行六字段:`name`、`description`、`license`、`compatibility`、`metadata`、`allowed-tools`。
- 出现其他字段(如 `argument-hint`)上传时**硬报错**:`Unexpected key(s) in SKILL.md frontmatter: argument-hint. Allowed properties are: ...`——不是忽略,是失败。
- 因此:**面向 claude.ai 分发 / API 调用的技能必须收敛到六字段**;Claude Code 独有的正文能力(如动态命令注入)在这些路径不生效。

## 4. 正文:占位符、参数与动态注入

**命令名来源**:个人/项目技能=目录名;`name` 只影响展示与插件命名空间;嵌套冲突技能=`子路径+目录名`(如 `apps/web:deploy`);`.claude/commands` 文件=文件名。

**字符串替换占位符**:

| 占位符 | 语义 |
|---|---|
| `$ARGUMENTS` | 完整参数文本;技能正文无任何占位符但用户传了参数时,自动在正文末尾追加 `ARGUMENTS: <input>` |
| `$ARGUMENTS[N]` / `$N` | 按位置取参(如 `$0`/`$1`);该位置无参数时**保留为字面文本** |
| `$name`(`arguments` 声明) | 命名参数按声明顺序映射位置;位置无实参时展开为空串 |
| `${CLAUDE_SKILL_DIR}` | 技能目录绝对路径(正文与 `allowed-tools` 的 Bash 规则两处都会替换) |
| `${CLAUDE_PROJECT_DIR}` | 项目根(可选);插件技能另有 `${CLAUDE_PLUGIN_ROOT}` / `${CLAUDE_PLUGIN_DATA}` |

**动态上下文注入(Claude Code 独有)**:

- 行首/空白后的 `` !`command` `` 会在技能内容送进上下文**之前**在本地执行,输出替换占位符——模型看到的是真实数据而非命令。
- 多行命令用 ` ```! ` 围栏块。替换只做一轮,输出不再二次扫描。
- 不满足"行首或紧跟空白"的位置(如 `` KEY=!`cmd` ``)保持字面不执行。
- 执行 shell 由 `shell` 字段与运行环境共同决定;默认走 Bash 工具,Windows 无 Git Bash 时用 PowerShell;命令与当前会话共享工作目录、2 分钟超时与输出上限。
- 企业可设 `"disableSkillShellExecution": true` 关闭(命令被替换为占位说明);**来自 claude.ai 同步的技能永不执行注入命令**。
- 正文任意处含 `ultrathink` 可让该技能触发一次深度推理(仅供 Claude Code)。

**加载与持久化**:技能被调用时,渲染后的 SKILL.md 以单条消息进入对话并跨轮保留(指令持续生效);权限类授权(如 `allowed-tools`)**每轮重置**。自动压缩(compact)后,最近一次调用的技能会重挂,每个保留前 5,000 token,合计预算 25,000 token,从最近调用者开始填充。

## 5. 调用机制

- 手动:`/skill-name [参数]`,斜杠即技能(与 `.claude/commands` 同一命名空间,技能优先)。
- 自动:模型读列表里的 `description`/`when_to_use` 匹配触发;受 `disable-model-invocation` / `user-invocable` / `paths` 约束。
- **技能堆叠**:一条消息可先写 `/a /b /c args` 依次加载多个 inline 技能(首个 + 最多后续 5 个),末尾文本作为各技能 `$ARGUMENTS`;遇到 fork 型或 `/loop` 类技能则在此截断。
- `context: fork` 技能默认**后台**执行(可 `background: false` 等待);后台 fork 的改动不纳入会话 checkpoint,`/rewind` 撤销不了,需用 git。
- 用户侧还可:`/permissions` 拒绝 Skill 工具整体禁用;settings `skillOverrides`(列表只留 name、隐藏指定技能);`/skill-doctor` 查使用率;`/doctor` 查列表上下文开销。

## 6. 渐进披露与上下文预算

- 列表常驻上下文,预算随模型窗口 **1%** 缩放;溢出时从"最少调用"的技能开始裁掉 description,技能名永远保留。
- 每条拼接文本上限 1,536 字符(可配);预算比例可配 `skillListingBudgetFraction`(如 `0.02`=2%)或 `SLASH_COMMAND_TOOL_CHAR_BUDGET`。
- 支持资源目录(`scripts/`、`references/` 等)按需读取,与标准渐进披露一致。

## 7. 分发 / 安装

- 个人/项目:拷贝目录到 `~/.claude/skills/` 或 `.claude/skills/` 即用;支持 symlink;实时生效。
- 插件:`<plugin>/skills/` 子目录或多个技能;命令自动带 `<plugin>:<skill>` 前缀。技能目录里加 `.claude-plugin/plugin.json` 可升级成 `skills-dir` 型插件,捆绑 agents/hooks/MCP。
- claude.ai:在网页/App 启用同步技能(下载到 `~/.claude/skills/synced/`,需 `CLAUDE_CODE_SYNC_SKILLS`),但只认六字段且不执行动态注入。
- 命令行自定义目录:`--add-dir` 追加技能来源目录。

## 8. 适配清单(把通用技能适配到 Claude Code)

- [ ] 校验 frontmatter 是否只有 `name`/`description` 打底;要增强就按下面逐项加,但记住 claude.ai/API 分发路径只放行六字段。
- [ ] `description` 与 `when_to_use` 合计 ≤1,536 字符,核心关键词放最前。
- [ ] 需要"仅用户手动触发"(部署、发消息等副作用)→ `disable-model-invocation: true`;需要"仅模型背景知识"→ `user-invocable: false`。
- [ ] 想让技能在隔离上下文里跑研究/重活 → `context: fork` + `agent:`(Explore/Plan/general-purpose)+ 可选 `background: false`。
- [ ] 技能要免确认执行自带脚本 → `allowed-tools: Bash(${CLAUDE_SKILL_DIR}/scripts/xxx.sh *)`,正文用 `${CLAUDE_SKILL_DIR}` 引用(插件版换成 `${CLAUDE_PLUGIN_ROOT}`)。
- [ ] 需要按文件自动触发 → `paths:` glob;需要进程级禁用的工具 → `disallowed-tools`。
- [ ] 参数:声明 `arguments:` 用 `$name`;按位置用 `$0`/`$1`/`$ARGUMENTS[N]`;整段用 `$ARGUMENTS`。不要依赖"无占位符=忽略参数",Claude 会尾附 `ARGUMENTS:`。
- [ ] 动态数据(PR 内容、当前分支等)用 `` !`cmd` `` 注入,避免让模型瞎猜;注意只能行首/空格后触发。
- [ ] 命名冲突:个人技能与项目技能同名时**个人版优先**——仓库里想覆盖用户个人同名技能会失败,留意。
- [ ] 结构:`name` 不必等于目录名(命令名=目录名),但建议保持一致,方便跨厂商。

## 9. 与标准基线差异速查

| 维度 | agentskills.io 基线 | Claude Code |
|---|---|---|
| 同名冲突 | 未规定 | Enterprise > Personal > Project > Bundled;插件命名空间隔离 |
| 命令来源 | 目录名 | 目录名(个人/项目)/ 插件名前缀+`name` / 嵌套目录限定名 |
| 子上下文执行 | 无 | `context: fork` + `agent` + `background`(独有) |
| 工具白名单 | 无 | `allowed-tools` / `disallowed-tools`(独有) |
| 动态注入 | 无 | `` !`cmd` `` / ` ```! ` 本地执行后注入(独有) |
| 触发补充 | — | `when_to_use`(拼入 description,合计 1,536 截断) |
| 目录限定名 | 无 | 嵌套同名技能 → `apps/web:deploy`(仅命名空间,非父子聚合) |
| 路径门控 | 无 | `paths` glob 限制自动加载 |
| 模型/推理控制 | 无 | `model` / `effort` / `ultrathink` 标记 |
| 分发 | 复制目录 | 插件/市场、claude.ai 同步(同步路径仅六字段) |
