# 设计说明:方言、指针与可验证语料

> 配套阅读:`docs/zh/overview.md`(结论与矩阵)、`docs/zh/maintenance.md`(维护节奏)、`skills/agent-skill-dialects/SKILL.md`(入口本体)。

## 为什么叫 "dialects(方言)"

同一份标准 SKILL.md(agentskills.io 的 `name` + `description` + Markdown 正文)在不同 AI 编码代理手里会被**不同地解释**:字段默认值、别名、非法值是被跳过还是拒绝、目录与 scope、显式调用语法、自动触发开关、分发方式都不一样。就像同一种语言在不同地区有不同的方言——语法规则大体相同,发音和用词各自为政。

本项目早期暂名 `provider-enhanced-skill`,那是个偏"内部实现"的名字,无法让通用技能作者秒懂用途。备选对比过 `skill-crosswalk`(对照表隐喻)、`skill-bridge`(搭桥)、`skill-compass`(指针指路)、`skill-polyglot`(多语言可移植)等。最终选择 `agent-skill-dialects`,因为它同时说清了三层意思:

1. 对象是 **agent skill**(而不是一般 prompt);
2. 视角是 **dialect**:同一份内容的不同变体,而不是互相独立的生态;
3. 用途是**对照与适配**:给写"一份通用 skill、跑多家厂商"的人当字典。

## 为什么做成"上下文指针"

Agent Skills 的通用约定是渐进披露:启动/索引时只读 frontmatter 的 `name`/`description`(发现层),命中后才载入正文(指令层),资源再按需读取。若把 16 家厂商的细节全部塞进 SKILL.md 正文,单次加载成本高,而且大部分内容与当前任务无关。

因此本技能采用指针形态:

- `SKILL.md` 只保留**路由表 + 通用可移植准则 + 关键差异速查**,本身约 70 行;
- 每家厂商一个 `references/<vendor>.md`,命中谁读谁;
- 文档里写明"先读 `00-standard-baseline.md`,再读目标厂商文档,按适配清单逐条核对"。

这与 agentskills 三层披露一致:指针 = 发现层,references = 指令层,references 内部引用的官方 URL = 资源层。

## 参考文档结构为什么同构

每家厂商文档共用同一模板(定位 → 目录与作用域 → frontmatter 与厂商扩展 → 加载/调用 → 适配清单 → 与标准差异速查)。理由:

- **可对比**:同一行问题(如"name 非法会怎样")在每家都有明确答案,横向扫一遍就能比较;
- **可机器校验**:`scripts/check-skill-contract.js` 强制"头三行(核对日期/官方来源/定位)齐全、代码围栏配对、映射表与文件一一对应",模板化是校验的前提;
- **可扩展**:新增厂商 = 复制模板 + 填事实 + 加一行映射表。

## 内容原则

1. **可验证优先**:每个事实都有官方来源;核对日期写进文件头。拿不到逐字原文就标注"以官方博客/Air Help 佐证"或"待复核",绝不编字段。
2. **标准优先,扩展归类**:通用主干只用标准字段;厂商字段一律标注为"增强/方言",并说明如果跨厂商迁移该字段会被怎样处理(Kimi 未知 `type` 整技能跳过、Qwen 非法 `name` 解析期拒绝、Copilot 静默不加载……)。
3. **差异五方向**:调用控制(`user-invocable`/`disable-model-invocation`/`allowed-tools`)、运行形态(fork/flow/mode 目录)、分发(plugin/marketplace/`skills` 安装)、生命周期(`/learn`、`/curator`、`/create-skill`)、UI 元数据(`icon`/`color`)。
4. **互操作提示**:写明"谁和谁同风格"(如 Kilo 与 Roo 的 `skills-{mode}`、OpenHands 与 Qwen 的 `paths` 门控),比逐字段罗列更有用。

## 边界:本项目不是什么

- 不是运行时行为约束——它是按需查阅的参考指针,不做注入、不产生副作用。
- 不实现厂商的专有技能(flow、父子 bundle 等是厂商能力,不是我们复刻的对象)。
- 不追求"全字段兼容清单"——重点是让你知道某个字段在某个厂商**会怎样失败**,从而写出只依赖标准字段的可移植主干。
- 不替代通用技能创作指南(官方 `skill-creator` 类)与 agentskills 规范原文。

## 项目形态

参照同组织的 `hiding-skill` 仓库设计:技能定义 + 双渠道分发(npm / Claude Code plugin marketplace)+ 静态契约校验 + 双语顶层文档。本仓库与 hiding-skill 的区别只在内容:它解决"清理",本仓库解决"适配前先查方言"。
