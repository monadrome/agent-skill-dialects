# 各厂商对 Agent Skills 的支持程度与拓展对比(总览)



> 调研日期:2026-09-07
> 触发来源:围绕 `has-sub-skill` 父子层级是否属于开放标准的调研
> 方法:以各厂商官方文档为准;逐条事实存放于 `skills/agent-skill-dialects/references/`(每个文件自带「核对日期 + 官方来源」),本文是横向结论与对比矩阵。

---

## 0. 结论摘要

1. **底层互操作层已事实标准化**:`SKILL.md` + frontmatter `name`/`description` 的 Agent Skills 开放格式(agentskills.io,Anthropic 主导)是行业共同基线,OpenAI 也宣称遵循同一标准。
2. **两个"通用目录"成为互操作枢纽**:`~/.agents/skills` 与 `.claude/skills` 被绝大多数厂商读取(Codex、Kimi、Gemini、Cursor、Copilot、Windsurf、Roo 等)。
3. **标准之外全是厂商扩展**:扩展集中在 5 个方向——调用控制(`user-invocable`/`disable-model-invocation`/`allowed-tools`)、运行形态(fork 子 agent / flow / mode 绑定)、分发(plugin / marketplace)、生命周期(`/learn`、`/curator`、`/create-skill`)、UI 元数据(`icon`/`color`/`metadata`)。
4. **“确定性下发”是新的扩展方向**:OpenHands 用 frontmatter 声明 `triggers:`(命中关键词即注入,仍可被模型调用)与 `paths:`(命中文件即按规则注入、**不可**被模型调用);连同 Qwen/Cursor 的 `paths`,行业正从“靠模型自觉选技能”走向“文件/关键词级自动触发”。
5. **父子 skill 层级不是开放标准,语义也各不相同**:
   - Kimi Code `has-sub-skill` = 唯一的功能性父子 bundle(聚合 + 限定命名加载);
   - Claude 目录限定名(`apps/web:deploy`)= 命名空间,无聚合语义;
   - Cursor 递归嵌套 = 官方声明"纯组织用途";
   - Roo 覆盖链 = 同名覆盖,不是父子聚合。

---

## 1. 开放标准基线(agentskills.io)

**标准定义的内容(各厂商共同基线):**

| 项目 | 标准内容 |
|---|---|
| 组织形态 | `<root>/skills/<skill-name>/SKILL.md`(skill 名 = 目录名) |
| frontmatter | 仅 `name`、`description` 两个字段是标准要求 |
| 正文 | Markdown 指令正文 |
| 附带资源 | `scripts/`、`references/`、`assets/` 等目录惯例(文档约定) |
| 调用 | 由模型按 `description` 自动判断触发;显式斜杠调用是产品层行为 |
| 推荐位置 | `.claude/skills`、`.agents/skills`、`.gemini/skills` 等命名空间目录 |

**标准里明确没有的**:`has-sub-skill`/父子层级、`allowed-tools`、`user-invocable`、`disable-model-invocation`、`context`、`priority`、`paths`、`icon/color/metadata`、`arguments`、flow 类型等——这些全部属于厂商扩展,是本次调研的重点。

---

## 2. 标准实现情况一览(目录/scope)

| 厂商/产品 | 主要读取目录(scope 从全局到项目) | 兼容互操作目录 |
|---|---|---|
| Claude Code | 企业级 > `~/.claude/skills` > `.claude/skills` > 插件内 `<plugin>/skills` | 也读 `.claude/commands` |
| OpenAI Codex | 系统级 `/etc/codex/skills` > `~/.agents/skills` > 自 CWD 向上到 repo 根的 `.agents/skills` | 标准目录即 `.agents/skills` |
| Kimi Code CLI | 项目 > 用户 `~/.kimi-code/skills` > extra > 内置;默认多品牌合并 | `.claude/skills`、`.codex/skills`、`.agents/skills` |
| Gemini CLI | 内置 > 扩展 > 用户 `~/.gemini/skills` > 工作区 `.gemini/skills` | 别名 `~/.agents/skills`、工作区 `.agents/skills` |
| Qwen Code | `~/.qwen/skills`(个人)、`.qwen/skills`(项目)、扩展/内置 | 兼容外部目录;本地观察(非官方证据):`.qwen/skills` 内见 symlink 指向 `.agents/skills` |
| Cursor | `~/.cursor/skills`、`.cursor/skills` | `.agents/skills`、兼容读 `.claude/skills`、`.codex/skills` |
| VS Code / GitHub Copilot | 用户 `~/.copilot/skills` > `.github/skills` | `.claude/skills`、`.agents/skills`;扩展经 `chatSkills` 声明 |
| Windsurf | `~/.codeium/windsurf/skills`(全局)、`.windsurf/skills`(项目)、企业系统层 | `.agents/skills`;开启后读 `.claude/skills` |
| Roo Code | `~/.roo/skills`(全局)、`.roo/skills`(项目) | `.agents/skills`(每层 `.roo/` 优先于 `.agents/`) |
| Cline | 用户 `~/.cline/skills`、项目 `.cline/skills`(推荐) | `.clinerules/skills`、`.claude/skills` |
| Trae IDE / Trae CLI | IDE:`.trae/skills` + `~/.trae-cn/skills`;CLI:`.traecli/skills` + `~/.traecli/skills` | CLI 同时读 Trae IDE 的 skill 目录 |
| JetBrains Junie | 用户 `~/.junie/skills` > 项目 `.junie/skills`;JetBrains Air 内另有共享 `.agents/skills` | Junie CLI 还读 built-in skills |
| Kilo Code(VS Code) | 用户 `~/.kilocode/skills` > 项目 `.kilocode/skills`;另有 mode 专属 `skills-{mode}/` | 新平台/CLI:共享技能池,不再用 mode 目录 |
| OpenHands | 项目 `<project>/.agents/skills` > 用户 `~/.agents/skills` > 公共注册表(OpenHands/extensions);legacy 保留 `.openhands/skills/`、`.openhands/microagents/` | 标准目录即 `.agents/skills`(legacy 目录仍兼容,但新技能一律用标准目录) |
| Continue(CLI) | 项目 `.continue/skills` > 用户 `$CONTINUE_HOME/skills`(另有 `.claude/skills` 兼容目录) | CLI 内置 Skills tool 按名读取;官方文档尚无独立页,以 PR #9696 为准 |

> 注:即使支持同一格式,各产品对"skill 变更何时生效"差异大(如 Trae/Kilo 需重启/重载 VS Code,Claude/Codex 有实时变更检测)。

---

## 3. 各厂商拓展(按扩展程度由浅到深排序)

### 3.1 接近纯标准实现(刻意克制)

**Gemini CLI**
- frontmatter 只保留 `name`/`description` 等最小字段,官方文档未引入产品私有的控制字段;
- 提供 `~/.agents/skills` 标准目录别名;
- 分发方式:`gemini skills install <url>`;
- 定位:最接近"标准参照系"的厂商实现。

**Windsurf**
- frontmatter 基础;调用上支持 `@skill-name` 手动 + 自动调用;
- 认可附带 supporting resources(scripts/references 等)约定;
- 产品内区分 Skills 与 Rules、Workflows 三类机制。

**Cline**
- frontmatter 基础;有技能开关 UI、渐进 3 级加载、`use_skill` 工具;
- 建议单条 SKILL.md < 5k token;沿用 docs/scripts/templates 目录惯例。

**Trae IDE / Trae CLI**
- 基础 `name`/`description`;`/skills` 展示;需重启生效;
- IDE 侧支持中文名;CLI 复用 IDE skill 目录。

**JetBrains Junie**
- 基础 `name`/`description`,可选字段按 agentskills 标准;未见公开的独家 frontmatter(官方页 403,待复核);
- 目录:用户 `~/.junie/skills`、项目 `.junie/skills`;JetBrains Air 内 Junie 与 Claude/Codex/Gemini 共享 `.agents/skills`;
- Junie CLI 提供 `/skills` 命令列出/开关技能,并捆绑 built-in skills。

**Continue CLI**(标准追随者,实现先行)
- 内置 Skills tool:列出/按名读取 SKILL.md,返回结构化 (name, description, content, optional files);
- 目录 `.continue/skills`、`.claude/skills`、`$CONTINUE_HOME/skills`;未见厂商扩展字段;
- 官方文档尚无独立 Skills 页,以 PR #9696 为准。

### 3.2 标准 + 调用控制 / 运行上下文扩展

**VS Code / GitHub Copilot**
- frontmatter 扩展:`argument-hint`(调用参数提示)、`user-invocable`、`disable-model-invocation`;
- `context: fork | inline`:`fork` 让 skill 在独立子 agent 中运行(执行隔离);
- 生成器:`/create-skill`;浏览:`/skills`;渐进式 3 级加载;
- 生态入口:扩展通过 package.json 的 `chatSkills` 声明;Copilot CLI 与 Cloud agent 复用同一格式。

**OpenHands**
- frontmatter 专有扩展:`triggers:`(YAML 关键词列表,命中即把正文注入上下文,技能仍可被模型调用)与 `paths:`(glob 门控,命中文件被读/改/建时注入 `<EXTRA_INFO>`,规则**不进 `<available_skills>`、模型不可调用**);两者同声明时 `paths:` 获胜;
- glob 采用 gitignore 风格、大小写敏感;支持扁平 `.agents/skills/*.md` 规则文件;仓库内作用域,ACP 会话不注入 path rules;
- 同名覆盖链:项目 > 用户 > 公共注册表;`.agents/skills/` 优先于 legacy `.openhands/skills/`、`.openhands/microagents/`;
- 官方注册表 `github.com/OpenHands/extensions`,Cloud 支持从 Git 仓库导入技能;
- 修改 SKILL.md 后需新开会话才重建技能目录。

**Qwen Code**
- frontmatter 扩展:`priority`(优先级)、`paths`(glob 门控,限定哪些文件场景触发)、`user-invocable`、`disable-model-invocation`;
- 独有生命周期机制:`/learn` 把知识/截图/视频蒸馏成 skill(带 `source: learned` 标记)、`/curator` 自动管理 skill 的创建/更新/归档(archive maintainer);
- 自家 `.qwen/skills` + 兼容外部目录的双轨结构,与 Kimi/Codex 同构。

### 3.3 深度扩展

**Cursor**(自 Cursor 2.4,2026-01 起支持)
- frontmatter 扩展:`icon`、`color`、`metadata`、`paths`、`disable-model-invocation`;
- skill 可表现为 Custom Mode(badge 化);嵌套目录递归拾取,monorepo 内自动 scope;
- 官方声明:嵌套"category folder"仅组织用途,skill 身份来自含 SKILL.md 的目录——即**不构成功能父子关系**;
- 内置技能表(`/migrate-to-skills`、`/create-skill`)与 Skills Marketplace 分发。

**Claude Code**(Agent Skills 标准的主导者,但扩展也多)
- frontmatter 扩展:`allowed-tools`(限定该 skill 可用工具)、`user-invocable`、`disable-model-invocation`、`context: fork`(按子 agent/subagent 执行);
- **动态上下文注入**:Markdown 正文中的反引号命令(`` `!command` ``)在加载时求值,把结果注入上下文;
- **目录限定命名**:嵌套技能以 `apps/web:deploy` 形式被引用(仅命名空间,非父子聚合);
- 插件体系:plugin 打包 skills 分发;`skillOverrides`;monorepo scope 规则;实时变更检测;bundle skills;同时读取 `.claude/commands`。

**Roo Code**
- 独有 **mode 绑定**:`skills-{mode}/` 目录(如 `skills-code/`)让 skill 只在指定 mode 生效;
- **四层覆盖链**:项目 `.roo/` → 项目 `.agents/` → 全局 `.roo/` → 全局 `.agents/`(优先级:项目 > 全局、mode 专属 > generic、同层 `.roo` > `.agents`;不含 mode 维度为四层,计入 `skills-{mode}/` 变体为 8 级,详见 `references/roo-code.md`);
- 名称规则严格;支持 symlink,不支持 alias——属于"标准之上加调度语义"的扩展。

**Kilo Code**(VS Code 扩展,与 Roo 同风格)
- **mode 专属目录**:`skills-{mode}/`(如 `skills-code/`、`skills-architect/`)让技能只在对应 mode 生效;
- 同名优先级:项目技能覆盖全局;mode 专属覆盖 generic;
- `name` 须等于目录名(≤64,小写字母/数字/连字符);`description` ≤1024;可选 license/compatibility/metadata;
- 支持 symlink(name 匹配链接名);监听 SKILL.md 变化但官方建议重载 VS Code;
- ⚠️ 新旧平台分叉:新平台/CLI 不用 mode 目录,技能进共享池,靠 `description` 区分。

**Kimi Code CLI**
- frontmatter 扩展:`type: prompt | inline | flow`、`whenToUse`、`disableModelInvocation`、`arguments`(正文以 `$0`/`$1`/`$<name>` 引用);
- **Flow skill**(独有):`type: flow` + Mermaid/D2 图,`/flow:<name>` 引导执行;
- **子技能层级**(独有,即本调研触发点):`has-sub-skill: true` 声明父 bundle,父/子 skill 构成层级;配套 `sub-skill.consolidate`、`sub-skill.review` 等"前缀限定命名"约定;演进:实验性发现 → 稳定 → 子技能限定命名(版本节点见 `references/moonshot-kimi-code.md` §5);
- 多品牌目录合并:默认 `merge_all_available_skills = true`,同时读 `.claude/skills`、`.codex/skills`、`.agents/skills`;
- 形态扩展:目录形式 + 扁平 `.md` 形式都支持;`extra_skill_dirs`/`--skills-dir`;body 占位符 `$KIMI_SKILL_DIR`、`${KIMI_CODE_HOME}`;`/skill:<name>` 斜杠调用并支持嵌套技能参数。

### 3.4 标准立场特殊者

**OpenAI Codex**
- 宣称遵循 agentskills.io 开放标准,读取路径 = `.agents/skills`(CWD 向上到 repo 根 + `~/.agents/skills` + `/etc/codex/skills` + 内置),支持 symlink;
- 调用控制:`$skill`/`/skills` 显式与隐式匹配;技能名清单预算(≤2% 上下文或 ~8k 字符);自动变更检测;
- 扩展集中在**分发层而非字段层**:插件(universal plugin directory,skill + MCP server + connector 打包)、`agents/openai.yaml`(UI/接口元数据、`policy.allow_implicit_invocation`)、`~/.codex/config.toml` 的 `[[skills.config]]`(path/enabled)、内置 `$skill-creator` 与 `$skill-installer`。

**Aider**(补充)
- 未发现原生 `SKILL.md` 加载机制,不计入标准实现方;
- 原生机制是 `CONVENTIONS.md` + `.aider.conf.yml` 的 `read:` 常驻注入 + 会话内 `/read`;
- 迁移路径:把 SKILL.md 正文同步为 conventions/read 文件,并保留 SKILL.md 作可移植主源(见 `skills/agent-skill-dialects/references/aider.md`)。

---

## 4. 焦点对比:frontmatter 字段跨厂商分布

| 字段 / 机制 | Claude | Kimi | Codex | Gemini | Qwen | Cursor | Copilot | Roo |
|---|---|---|---|---|---|---|---|---|
| `name` / `description`(标准) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `user-invocable` | ✅ | — | — | — | ✅ | — | ✅ | — |
| `disable-model-invocation` | ✅ | ✅ | — | — | ✅ | ✅ | ✅ | — |
| `allowed-tools` | ✅ | — | — | — | — | — | — | — |
| `context: fork`(子 agent) | ✅ | — | — | — | — | — | ✅ | — |
| `type: flow`(引导流程) | — | ✅ | — | — | — | — | — | — |
| `has-sub-skill`(父子层级) | — | ✅ | — | — | — | — | — | — |
| `arguments` + 占位符 | — | ✅ | — | — | — | — | — | — |
| `priority` | — | — | — | — | ✅ | — | — | — |
| `paths`(glob 门控) | — | — | — | — | ✅ | ✅ | — | — |
| `icon` / `color` / `metadata` | — | — | — | — | — | ✅ | — | — |
| `argument-hint` | — | — | — | — | — | — | ✅ | — |
| mode 专属目录(`skills-{mode}`) | — | — | — | — | — | — | — | ✅ |
| 目录限定名(`apps/web:deploy`) | ✅ | — | — | — | — | ⚠️组织级 | — | — |
| 覆盖链语义 | — | — | — | — | — | — | — | ✅ |

> 注:上表只列“多厂商共现”字段。独家字段/机制见 `skills/agent-skill-dialects/references/` 各厂商文档:OpenHands `triggers:` 与 `paths:`(路径规则化,模型不可调)、Kilo 的 `skills-{mode}/` mode 目录(与 Roo 同风格)、Trae 的 name 非法时静默回退目录名、Continue 的内置 Skills tool、Aider 无原生支持等。

---

## 5. 参考来源

- Agent Skills 开放标准:https://agentskills.io
- Claude Code Skills:https://code.claude.com/docs/en/skills.md
- Kimi Code CLI Skills:https://www.kimi.com/code/docs/en/kimi-code-cli/customization/skills.html / https://www.kimi-cli.com/en/customization/skills.html
- OpenAI Codex Build skills:https://learn.chatgpt.com/docs/build-skills(开发者入口 https://developers.openai.com/codex/skills 308 重定向至此;Markdown 版在 URL 后加 `.md`)
- Gemini CLI Skills:https://geminicli.com/docs/cli/creating-skills/
- Qwen Code Skills:https://qwenlm.github.io/qwen-code-docs/en/users/features/skills/
- Cursor Skills:https://cursor.com/docs/context/skills
- VS Code / GitHub Copilot Agent Skills:https://code.visualstudio.com/docs/copilot/customization/agent-skills
- Windsurf Cascade Skills:https://docs.windsurf.com(含日语镜像路径)
- Roo Code Skills:https://roocodeinc.github.io/Roo-Code/features/skills/
- Cline Skills:https://docs.cline.bot/customization/skills
- Trae CLI Skills:https://docs.trae.cn/cli_skills
- OpenHands Skills:https://docs.openhands.dev/overview/skills(关键词触发 /overview/skills/keyword;路径触发规则 /overview/skills/path;注册表 https://github.com/OpenHands/extensions)
- JetBrains Junie Skills(官方博客,2026-03-25):https://blog.jetbrains.com/idea/2026/03/ai-assisted-java-application-development-with-agent-skills/ ;Air Help · Skills:https://www.jetbrains.com/help/air/skills.html(Junie 官方技能页核对日 403,待复核)
- Kilo Code Skills:https://kilocode.ai/docs/features/skills(仓库 pin:raw.githubusercontent.com/Kilo-Org/kilocode/8cd6a250/apps/kilocode-docs/docs/features/skills.md)
- Continue CLI Agent Skills(PR #9696):https://github.com/continuedev/continue/pull/9696 ;追踪 issue #11758
- Aider conventions:https://aider.chat/docs/usage/conventions.html
