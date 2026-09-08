# Agent Skill Dialects

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![English](https://img.shields.io/badge/lang-English-blue.svg)](README.md)
[![CI](https://github.com/monadrome/agent-skill-dialects/actions/workflows/test.yml/badge.svg)](https://github.com/monadrome/agent-skill-dialects/actions/workflows/test.yml)

**同一份 SKILL.md,在不同厂商手里是不同的"方言"。**

Agent Skill Dialects 是各 AI 编程 / Agent 厂商对 [agentskills.io](https://agentskills.io) 开放格式实现与扩展的**本地离线参考**。同一份标准技能文件在不同厂商行为不同:字段默认值、别名、被跳过还是静默失败、目录与 scope、调用机制。本仓库以"上下文指针"型技能分发:`SKILL.md` 只做路由,细节在 `references/` 按需加载。

适用场景:写一份能在多家厂商跑的通用 SKILL.md;或把已有技能跨厂商移植,想知道某字段会被采纳、别名化、忽略还是拒绝——不用每次都联网翻各家文档。

## 快速开始

让 agent 拿到这份参考最快的方式:

```bash
npx skills add monadrome/agent-skill-dialects
```

Claude Code 走插件市场:

```text
/plugin marketplace add https://github.com/monadrome/agent-skill-dialects.git
/plugin install agent-skill-dialects@agent-skill-dialects
```

然后直接问,例如:

```text
我要写一份同时给 Claude Code 和 Kimi Code 用的 SKILL.md。
查一下 agent-skill-dialects 参考,列出我的字段里哪些会被跳过或拒绝。
```

agent 会按目标厂商路由,只读取命中厂商的文档并逐条过「适配清单」。

## 工作方式

Agent Skills 采用渐进披露:发现层只读 `name`/`description`,命中才载入 SKILL.md 正文,资源按需读取。把 16 家细节全塞进一个文件只会浪费上下文。于是:

- `SKILL.md` 保留路由表、通用可移植准则与关键差异速查;
- 每家厂商一个 `references/<vendor>.md`,同构模板:定位 → 目录与作用域 → frontmatter 与厂商扩展 → 加载与调用 → 适配清单 → 与标准差异速查;
- 每份文档带「核对日期 + 官方来源」;无法逐字核对的事实显式标注(如 JetBrains Junie 官方页当前 403),待补项见 [更新](#更新)。

## 安装

### npm

```bash
npm install -D @huatalk/agent-skill-dialects
```

包内包含 `skills/agent-skill-dialects/` 与文档;`skills-npm` 一类安装器可把技能目录接入各 agent。

### Agent Skills(`npx skills`)

```bash
npx skills add monadrome/agent-skill-dialects
```

兼容性与安装位置由安装器和各家 Skill 实现决定(Codex、Cursor、Windsurf、Gemini CLI、GitHub Copilot、Cline 等)。

### Claude Code 插件

```text
/plugin marketplace add https://github.com/monadrome/agent-skill-dialects.git
/plugin install agent-skill-dialects@agent-skill-dialects
```

装完重启 Claude Code,插件命令为 `/agent-skill-dialects`。

> ⚠️ 以上发行命令(`npx skills add`、marketplace 安装与插件命令名)在首次发布前待真机验证。

### 手动拷贝 / 软链

把整个 `skills/agent-skill-dialects/` 目录拷贝(或软链)到目标厂商技能根目录即可:

```bash
ln -s $PWD/skills/agent-skill-dialects ~/.kimi-code/skills/agent-skill-dialects   # Kimi Code CLI
ln -s $PWD/skills/agent-skill-dialects ~/.claude/skills/agent-skill-dialects      # Claude Code
ln -s $PWD/skills/agent-skill-dialects ~/.agents/skills/agent-skill-dialects      # Codex / OpenHands 等
ln -s $PWD/skills/agent-skill-dialects ~/.traecli/skills/agent-skill-dialects     # Trae CLI
ln -s $PWD/skills/agent-skill-dialects ~/.kilocode/skills/agent-skill-dialects    # Kilo Code
ln -s $PWD/skills/agent-skill-dialects ~/.roo/skills/agent-skill-dialects         # Roo Code
ln -s $PWD/skills/agent-skill-dialects ~/.junie/skills/agent-skill-dialects       # JetBrains Junie
```

不要拆散 `SKILL.md` 与 `references/` 的配对。安装后按厂商生效规则操作(多数需新开会话;Trae CLI / Kilo Code 可能要重启或重载窗口),并用厂商的技能列表命令验证。

## 内容结构

一个"上下文指针"技能 + 1 份基线 + 16 家厂商语料:

| 目标厂商 / 产品 | 引用文档 |
|---|---|
| 任何厂商(标准基线) | `skills/agent-skill-dialects/references/00-standard-baseline.md` |
| Anthropic Claude Code | `skills/agent-skill-dialects/references/anthropic-claude-code.md` |
| Moonshot Kimi Code CLI | `skills/agent-skill-dialects/references/moonshot-kimi-code.md` |
| OpenAI Codex / ChatGPT | `skills/agent-skill-dialects/references/openai-codex.md` |
| Alibaba Qwen Code | `skills/agent-skill-dialects/references/alibaba-qwen-code.md` |
| Anysphere Cursor | `skills/agent-skill-dialects/references/cursor.md` |
| GitHub Copilot(VS Code / CLI / Cloud) | `skills/agent-skill-dialects/references/github-copilot.md` |
| Google Gemini CLI | `skills/agent-skill-dialects/references/gemini-cli.md` |
| Windsurf | `skills/agent-skill-dialects/references/windsurf.md` |
| Roo Code | `skills/agent-skill-dialects/references/roo-code.md` |
| Cline | `skills/agent-skill-dialects/references/cline.md` |
| OpenHands | `skills/agent-skill-dialects/references/openhands.md` |
| Trae IDE / Trae CLI | `skills/agent-skill-dialects/references/trae.md` |
| JetBrains Junie | `skills/agent-skill-dialects/references/jetbrains-junie.md` |
| Kilo Code | `skills/agent-skill-dialects/references/kilo-code.md` |
| Continue CLI | `skills/agent-skill-dialects/references/continue.md` |
| Aider(无原生支持,含迁移路径) | `skills/agent-skill-dialects/references/aider.md` |

跨厂商结论与对比矩阵见 [总览](docs/zh/overview.md);设计取舍见 [设计说明](docs/zh/design.md);维护约定见 [维护](docs/zh/maintenance.md)。中文文档是权威内容,英文(`README.md` / `docs/en/`)是对齐摘要。

## 设计原则

- **标准优先,扩展归类**:通用主干只用 `name`/`description` + Markdown 正文;厂商字段一律当"增强/方言",并说明迁移时怎么失败(Kimi 未知 `type` 整技能跳过;Qwen 非法 `name` 解析期拒绝;Copilot 静默不加载)。
- **只讲可验证事实**:每份文档带「核对日期 + 官方来源」;无法逐字核实的标"待复核",绝不发明。
- **方言视角,而非各自生态**:把厂商看成同一种格式的不同变体,"谁和谁同风格"(Kilo 与 Roo 都用 `skills-{mode}`)就一目了然。

## 校验与局限

- 仓库契约校验(`npm test`):版本三处一致、SKILL.md 路由表与 `references/` 一一对应(单层)、每份文档头三行齐全、代码围栏配对、无旧技能名与 `【F:…】` 引用标记、本地链接有效且 npm 包覆盖已发布文档引用的文件、README 双语小节数一致、docs/en 纯英文。
- 语料是带核对日期的快照,不是实时镜像;厂商行为会变,见 [更新](#更新) 与 [维护](docs/zh/maintenance.md)。
- 本仓库不实现厂商原生能力(flow 执行、父子 bundle 等),也不替代 agentskills 规范原文与通用技能创作指南。

## 更新

厂商行为会变。建议每 1–3 个月复核一次,厂商发布涉及技能行为的变更时立即复核。2026-09-07 已知待补:JetBrains Junie 技能页 403(官方博客 + Air Help 佐证);Continue CLI 尚无独立技能文档页(以 PR #9696 为准);Kilo Code VS Code 扩展与"新平台"在 mode 目录上分叉;Kimi Code 新旧两版文档(`~/.kimi-code/` 与 `~/.kimi/`)并存。完整清单与流程见 [维护](docs/zh/maintenance.md)。

## 参与贡献

欢迎内容贡献、带官方来源的事实修正与新厂商文档。仓库布局、语言约定与发布流程见 [CONTRIBUTING.md](CONTRIBUTING.md) 与 [AGENTS.md](AGENTS.md)。

## 许可证

[MIT](LICENSE)
