# OpenAI Codex / ChatGPT

> 核对日期:2026-09-07
> 官方来源:learn.chatgpt.com「Build skills」章节(https://learn.chatgpt.com/docs/build-skills,Markdown 版在页面 URL 后加 `.md`;开发者入口 developers.openai.com/codex/skills 重定向至此);标准依据:agentskills.io
> 定位:声称完整遵循开放标准,**扩展几乎不放在 frontmatter 层,而放在分发与元数据层**——插件(universal plugin directory)、`agents/openai.yaml`、`config.toml`。frontmatter 仅 `name`+`description` 必需,最贴近纯标准。

---

## 1. 目录扫描与作用域

| Scope | 位置 | 说明 |
|---|---|---|
| REPO(嵌套) | `$CWD` 向上每一级目录的 `.agents/skills` | 组织可在父目录投放"区域技能" |
| REPO(根) | `$REPO_ROOT/.agents/skills` | git 仓库根,全仓可用 |
| USER | `~/.agents/skills` | 个人,跨仓库 |
| ADMIN | `/etc/codex/skills` | 机器/容器级共享、SDK 脚本 |
| SYSTEM | 随 Codex 内置 | 如 `$skill-creator`、plan 等 |

- **同名不合并**:同名技能会并列出现在选择器里,由模型/用户挑。
- 支持 **symlink**,扫描时跟随链接目标。
- 技能变更**自动检测**;偶发未生效则重启 Codex。

## 2. 结构与 frontmatter(最接近纯标准)

技能 = 目录 + `SKILL.md`(必需)+ 可选 `scripts/`、`references/`、`assets/`、`agents/`。

```markdown
---
name: skill-name
description: Explain exactly when this skill should and should not trigger.
---
Skill instructions ...
```

- `name` + `description` 是仅有的必需字段;**无厂商扩展 frontmatter 字段**(不识别 `paths`/`user-invocable`/`allowed-tools` 等,别的厂商字段在此既无功能也无意义——Codex 靠 description 与 openai.yaml 控制行为)。
- `description` 写法直接决定隐式匹配:开头放关键用例与触发词;Codex 在上下文紧张时会**优先缩短 description**(见 §5),所以要"短、前置关键词、边界清晰"。

## 3. 调用机制

| 方式 | 语法 | 说明 |
|---|---|---|
| 显式 | `$skill-name` 提及(Codex CLI / IDE);ChatGPT 桌面 `@`;`/skills` 打开选择器 | 选择后技能常驻可用 |
| 隐式 | 模型按 `description` 匹配自动加载 | 可由 `agents/openai.yaml` 的 `policy` 关闭 |
| 内置生成器 | `$skill-creator`(CLI)/ `@skill-creator`(ChatGPT Work) | 问答式创建技能 |
| 录制 | Record & Replay | 录制操作流自动草拟技能 |

## 4. 厂商扩展(集中在目录/分发层)

### 4.1 可选元数据 `agents/openai.yaml`(技能目录内)

控制界面展示、调用策略、工具依赖:

```yaml
interface:
  display_name: "Optional user-facing name"
  short_description: "Optional user-facing description"
  icon_small: "./assets/small-logo.svg"
  icon_large: "./assets/large-logo.png"
  brand_color: "#3B82F6"
  default_prompt: "Optional surrounding prompt to use the skill with"

policy:
  allow_implicit_invocation: false   # 默认 true;false = 只允许显式 $skill/@,禁止按 description 隐式触发

dependencies:
  tools:
    - type: "mcp"
      value: "openaiDeveloperDocs"
      description: "OpenAI Docs MCP server"
      transport: "streamable_http"
      url: "https://developers.openai.com/mcp"
```

要点:

- `allow_implicit_invocation: false` 是 Codex 侧"仅手动调用"的等价物(对应其他厂商的 `disable-model-invocation`)——以独立 YAML 而非 SKILL.md frontmatter 表达。
- `dependencies.tools` 声明 MCP 等工具依赖,宿主可据此预配置,获得更顺滑的体验。
- `interface.*` 面向 ChatGPT 桌面 App 等 UI。

### 4.2 插件(分发主通道)

- 插件 = 一个或多个技能 + 可选 MCP server 连接/配置 + connector + 展示资源,打包进 **universal plugin directory**,ChatGPT(Web/桌面/移动、Chat 与 Work)与 Codex CLI/桌面共用。
- 技能散装目录只适合本地创作与仓库内流程;**对外分发一律建议打包成插件**。
- 插件技能同样走"先 name+description 列表、命中后读 SKILL.md"的渐进披露。

### 4.3 安装 curated 技能与启停

```bash
$skill-installer linear        # 安装社区 curated 技能(如 $linear)
```

- 本地 `~/.codex/config.toml` 禁用技能(不删除):

```toml
[[skills.config]]
path = "/path/to/skill/SKILL.md"
enabled = false
```

- 改完 `~/.codex/config.toml` 后重启 Codex。

## 5. 渐进披露与上下文预算

- 初始列表含每个技能的 name/description 与**文件路径**。
- 列表预算:**不超过上下文窗口 2%,窗口未知时 8,000 字符**;超预算先截短 description;技能很多时直接省略部分技能并告警。
- 预算只作用于初始列表;模型选定某技能后仍会读取完整 SKILL.md 指令。

## 6. 适配清单(把通用技能适配到 Codex / ChatGPT)

- [ ] 目录放进 `.agents/skills/`(仓库内逐层、`~/.agents/skills`、`/etc/codex/skills`)或打包成插件。
- [ ] frontmatter 只保留 `name`/`description` + 正文:其他厂商的 frontmatter 增强字段在 Codex 无效果,携带它们只会在别的读取方造成噪音/被跳过风险。
- [ ] description 精炼到"做什么 + 何时该用 + 何时不该用",关键触发词前置(列表被截短时靠开头存活)。
- [ ] 需要"仅显式调用":写 `agents/openai.yaml` 的 `policy.allow_implicit_invocation: false`,并在 SKILL.md 正文里写清必须由 `$skill-name` 显式触发。
- [ ] 技能依赖 MCP 工具:在 `agents/openai.yaml` 的 `dependencies.tools` 声明,便于宿主预配。
- [ ] 需要跨会话/UI 友好名称与图标:填 `interface.*`。
- [ ] 资源引用:正文用相对路径引用 `scripts/`、`references/`、`assets/`;多技能/对外分发打包成插件。
- [ ] 校验:CLI 里 `/skills` 或 `$` 提及能看到技能;改完 `config.toml` 记得重启。

## 7. 与标准基线差异速查

| 维度 | agentskills.io 基线 | Codex / ChatGPT |
|---|---|---|
| 安装目录 | 未统一 | `.agents/skills` 自 CWD 逐层到仓库根、`~/.agents`、`/etc/codex`、内置 |
| frontmatter 扩展 | — | **无**(克制派);行为控制在 `agents/openai.yaml` |
| 仅手动调用 | — | openai.yaml `policy.allow_implicit_invocation: false`(不是 frontmatter 字段) |
| 显式语法 | 产品层 | `$skill` / `/skills` / `@skill` |
| 分发 | 复制目录 | 插件(universal plugin directory,可捆绑 MCP/connector) |
| curated 安装 | — | `$skill-installer` |
| 启停 | — | `config.toml [[skills.config]]` |
| 同名 | 未规定 | 不合并、并列展示 |
| 列表预算 | 未规定 | ≤2% 上下文或 8,000 字符,先截 description |
