# Trae(TraeCode CLI / Trae IDE)

> 核对日期:2026-09-07
> 官方来源:https://docs.trae.cn/cli_skills(中文官方文档;`docs.trae.ai/cli_skills` 会跳转后 404,勿用)
> 定位:"克制派 + 双入口"派:frontmatter 只有标准 `name`/`description`,无任何厂商控制字段(无禁用自动调用、无 tool 白名单),靠**高质量的 description** 做按需触发;最大差异在**兼容读取 Trae IDE 技能目录**(`.trae/skills/`、`~/.trae-cn/skills`)与**名称校验失败时静默回退目录名**。

---

## 1. 目录与作用域

| 类型 | 目录 | 说明 |
|---|---|---|
| 全局技能 | `~/.traecli/skills/{name}/SKILL.md` | 个人/团队通用范式、可复用工具链、长期偏好 |
| 项目技能 | `<project>/.traecli/skills/{name}/SKILL.md` | 项目业务规则、技术栈约束、术语映射、MCP 协同 |

- 每个技能必须是**独立文件夹**,且**必须包含 `SKILL.md`**(核心入口)。
- 推荐目录树:`SKILL.md`(必需)+ `reference.md` / `examples.md` / `scripts/`(可选,渐进披露,按需加载)。
- 同一目录只支持标准技能形态;官方不要求也**不支持**额外的 frontmatter 控制字段。

## 2. frontmatter 规则

| 字段 | 必填 | 规则 |
|---|---|---|
| `name` | 是 | 仅小写字母/数字/连字符;不可含中文、空格等;**若非法,静默回退为目录名**(不报错) |
| `description` | 是 | TraeCode CLI 判断**何时触发**的关键依据;写清"做什么 + 什么时候用" |

- description 质量直接决定触发成败。官方正例:"从 PDF 文件中提取文本和表格。当用户提到需要处理 PDF、表单或从文档中提取内容时使用";反例:"处理文档"。
- 触发失败排查:description 太模糊、路径错误、YAML 语法错误(`---` 完整、勿用 Tab)、**未重启 CLI**。

## 3. 专有扩展与兼容行为

- **无**专有 frontmatter 字段(与 Kimi/Copilot 等相反);所有触发逻辑走标准 `description` + 渐进披露。
- 可选辅助文件是文档层约定:在 SKILL.md 中自然引用 `reference.md`、`examples.md`、`scripts/xxx`,CLI 需要时才加载。

### 兼容读取 Trae IDE 技能(TraeCode CLI 独有行为)

| 来源 | 目录 | 备注 |
|---|---|---|
| Trae IDE 项目技能 | `.trae/skills/` | TraeCode CLI 可直接读取运行 |
| Trae IDE 全局技能 | `~/.trae-cn/skills` | 同上 |

- **名称兼容坑**:Trae IDE 允许技能名含中文,但 **TraeCode CLI 无法识别中文名技能**。跨工具共享时 `name` 只用 ASCII 小写。

## 4. 加载与验证

- 按需触发:技能并非常驻,请求与 description 匹配时才动态加载激活。
- 渐进披露:主文件保持精简,长文档/示例/脚本放辅助文件。
- **创建/修改技能后必须重启 TraeCode CLI** 才能加载最新版。
- 验证:`/skills` 命令列出并确认已配置技能。
- 分发:目录进 Git 即可,团队 `git pull` 后获得(仍要重启生效)。

## 5. 适配清单

- [ ] 目录形态 `.traecli/skills/{name}/SKILL.md`;目录名小写 ASCII。
- [ ] `name` 只写小写字母/数字/连字符,别写中文/空格(IDE 允许但 CLI 不认)。
- [ ] `description` 同时写"做什么 + 何时用",前置具体关键词;Trae 无其他触发开关,description 就是全部。
- [ ] 复杂技能拆分 `reference.md`/`examples.md`/`scripts/`,正文用相对路径引用。
- [ ] 期望 Trae IDE 也能用 → 用 `.trae/skills/`(IDE 原生);期望 CLI+IDE 都覆盖 → 放 `.traecli/skills/` 与 IDE 各自目录,别依赖自动互通细节。
- [ ] 修改后重启 CLI,用 `/skills` 复核。
- [ ] 与标准基线无字段差异,跨厂商可移植性最好的一档(迁移时不需要删字段)。

## 6. 与标准基线差异速查

| 维度 | agentskills.io 基线 | Trae |
|---|---|---|
| 厂商控制字段 | 无 | 无(最接近纯标准的实现之一) |
| name 非法处理 | 未规定(多数报错/跳过) | 静默回退为目录名 |
| IDE/CLI 双入口 | 未涉及 | CLI 兼容读取 `.trae/skills/` 与 `~/.trae-cn/skills`(IDE 技能) |
| 中文名 | 规范要求 ASCII | IDE 技能可用中文,CLI 不识别 |
| 生效方式 | 各家不同 | 必须重启 CLI(无热加载) |
| 验证命令 | 无 | `/skills` |
