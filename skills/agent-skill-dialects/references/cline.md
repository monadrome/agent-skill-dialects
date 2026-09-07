# Cline(VS Code 扩展)

> 核对日期:2026-09-07
> 官方来源:https://docs.cline.bot/customization/skills
> 定位:标准实现的"工程化"派——frontmatter 无私有控制字段,但把**渐进披露量化**了(metadata ~100 tokens / instructions <5k tokens / 资源按需),并给出明确的目录打包约定(`docs/` `templates/` `scripts/`)。

---

## 1. 目录与作用域

| 层级 | 位置 |
|---|---|
| 项目 | `.cline/skills/{name}/SKILL.md`(官方推荐)+ 兼容 `.clinerules/skills/`、`.claude/skills/` |
| 全局 | `~/.cline/skills/`(macOS/Linux;Windows 为 `%USERPROFILE%\.cline\skills\`) |

- 自动发现目录中的技能;每个技能在 **Skills 菜单里有启停开关**(默认启用,可停用而不删目录,适合本地开发时关掉 CI/CD 类技能)。
- **同名冲突:Cline 里全局技能优先于项目技能**(官方如此说明,与多数厂商相反——项目里想覆盖同名全局技能时留意)。
- 生命周期:菜单里“New skill…”按模板建技能,也可手动建目录。

## 2. 结构与约定

- `SKILL.md` 必须:`name`(小写 kebab-case,**必须与目录名完全一致**)+ `description`(触发依据,≤1024 字符)。
- 正文前载原则:Cline 顺序读文件,重要内容放前面,用 `## Error Handling` 这类清晰标题便于扫描。
- **≤5k tokens**:单文件超过就拆到 `docs/` 并按需引用;正文里只引用,引用到的文件才被读。
- 打包约定(随技能目录分发,正文相对路径引用):
  - `docs/`:过细/低频信息(高级配置、故障排查、平台差异),按场景加载;
  - `templates/`:要生成的配置/脚手架/文档模板;
  - `scripts/`:确定性操作(校验、数据处理、API 调用)——脚本只有输出进上下文,代码本身不占上下文,500 行校验脚本只产生一行 “Passed”。
- 与 rules 的分工:rules 常驻,技能按需加载——短的行为约束用 rules,领域流程用 skills。

## 3. 渐进披露与调用

| 级别 | 何时载入 | 成本 |
|---|---|---|
| Metadata | 启动常驻 | ~100 tokens/技能(name+description) |
| Instructions | 技能被触发 | <5k tokens(SKILL.md 正文) |
| Resources | 需要时 | 几乎不限(docs/templates/scripts 按需) |

- 自动:请求匹配 description → Cline 用 `use_skill` 工具激活并载入全文。
- 手动:斜杠调用 `/name`(`/` 打开命令建议,如 `/aws-deploy`)强制触发。
- 无 `disable-model-invocation`/`user-invocable` 等 frontmatter 控制字段;启停通过 Skills 菜单的 toggle。

## 4. 适配清单

- [ ] 目录名 = `name` = kebab-case 小写;`description` ≤1024,写"做什么 + 何时用 + 触发词/文件类型/领域"。
- [ ] 正文保持在 <5k tokens;多了拆 `docs/` 并相对引用,否则永远进上下文浪费预算。
- [ ] 确定性步骤放 `scripts/`(只输出进上下文);产出模板放 `templates/`;平台/低频细节放 `docs/`。
- [ ] 想临时禁用某技能 → 菜单 toggle,不必删目录。
- [ ] 跨 agent 复用:内容保持纯标准;装到 `.cline/skills/` 之外的兼容目录(`.claude/skills` 等)时注意各厂商同名优先级不同(Cline 全局>项目)。

## 5. 与标准基线差异速查

| 维度 | agentskills.io 基线 | Cline |
|---|---|---|
| frontmatter 扩展 | — | 无(克制派,量化渐进披露) |
| 同名冲突 | 未规定 | 全局 > 项目(与多数厂商相反) |
| 显式调用 | 产品层 | 斜杠 `/name` + `use_skill` 工具 |
| 体积约束 | 无 | 官方建议 SKILL.md <5k tokens |
| 资源打包 | 目录惯例 | 明确 docs/ templates/ scripts/ 语义 |
| 启停 | — | Skills 菜单 toggle(不删目录) |
