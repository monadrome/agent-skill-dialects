# Kilo Code(VS Code 扩展 / Kilo CLI / 新平台)

> 核对日期:2026-09-07
> 官方来源:
> - 当前文档页:https://kilocode.ai/docs/features/skills
> - 仓库内原始文档(pin 到 8cd6a250):https://raw.githubusercontent.com/Kilo-Org/kilocode/8cd6a250/apps/kilocode-docs/docs/features/skills.md
> - 中文镜像(核对日 HTTP 429,勿作主源):https://kilo.org.cn/docs/agent-behavior/skills
> - 新平台文档(§4 引用):https://kilo.ai/docs/customize/skills
> 定位:"标准 + mode 目录"派(与 Roo Code 同风格):严格 agentskills.io,核心扩展是**按 mode 生效的目录后缀 `skills-{mode}/`** 与 **项目覆盖全局、mode 覆盖 generic 的优先级**。⚠️ Kilo 新旧两套平台行为不同(见 §4)。

---

## 1. 目录与作用域

### VS Code 扩展(`.kilocode` 命名空间)

| 类型 | 目录 | 说明 |
|---|---|---|
| 全局 · generic | `~/.kilocode/skills/{name}/SKILL.md` | 所有 mode 可用 |
| 全局 · mode 专属 | `~/.kilocode/skills-{mode}/…` | 仅对应 mode 生效,如 `~/.kilocode/skills-code/`、`~/.kilocode/skills-architect/` |
| 项目 · generic | `<project>/.kilocode/skills/{name}/SKILL.md` | 随仓库走版本控制,团队共享 |
| 项目 · mode 专属 | `<project>/.kilocode/skills-{mode}/…` | 仅该项目对应 mode |

- mode slug 与 mode 标识一致(`code`、`architect`、`ask`、`debug` 等)。
- **`SKILL.md` 必须直接位于技能目录内**,不可再嵌套一层。
- 可选捆绑资源:`scripts/`、`references/`、`assets/`(与标准惯例一致,正文相对路径引用)。

## 2. frontmatter(遵循 agentskills 规范)

| 字段 | 必填 | 约束 |
|---|---|---|
| `name` | 是 | ≤64 字符;小写字母/数字/连字符;**不得以连字符开头或结尾**;**必须与父目录名完全一致** |
| `description` | 是 | ≤1024 字符;写做什么 + 何时用 |
| `license` | 否 | 许可证名或引用捆绑 license 文件 |
| `compatibility` | 否 | 环境要求(目标产品、系统包、网络等) |
| `metadata` | 否 | 任意键值元数据 |

- name 不匹配目录 → 技能不加载,Output 面板报 "name doesn't match directory"。

## 3. 优先级、加载与调试

- **同名优先级**:① 项目技能覆盖全局技能;② mode 专属技能覆盖 generic 技能(Code mode 下 `skills-code/` 里的同名技能胜过 `skills/` 里的)。
- 加载时机:VS Code 启动 / 手动 Reload Window(`Cmd+Shift+P` → Developer: Reload Window)。虽然会监听 SKILL.md 变化,官方仍说**最可靠是 reload**。
- **symlink 支持**:可软链整个 skills 目录或单个技能;用 symlink 时 `name` 必须匹配**链接名**,不是 target 目录名。
- 调试入口:`View → Output → "Kilo Code"`,查 skill 相关报错;常见错为缺 `name`、name 不匹配目录、目录层级放错。

## 4. 新旧平台差异(重要,勿混)

| 行为 | VS Code 扩展(本文 §1-§3) | 新平台(kilo.ai/docs/customize/skills) |
|---|---|---|
| mode 专属目录 | `skills-{mode}/` 生效 | **不使用 mode 专属目录**,全部技能进共享池,由 agent 依据 description 与当前任务自行决定调用 |
| skill 分发对象 | 目录含 `SKILL.md` + 可选文件 | 平台对象含 `name`(须匹配目录名)、`version`(可选,用于刷新缓存)、`files`(须含 `SKILL.md`) |
| 覆盖规则 | 项目>全局;mode>generic | 同名时 project-level 覆盖(其余按平台文档) |

- 迁移含义:针对**新平台/CLI**写技能时,不要依赖 `skills-{mode}/`,应把"适用 mode/场景"写进 `description`;针对 **VS Code 扩展**才用 mode 目录。

## 5. 适配清单

- [ ] VS Code 扩展:目录名 = `name`,≤64,小写字母/数字/连字符,无首尾连字符;`description` ≤1024。
- [ ] 技能仅属于某 mode → 放 `skills-{mode}/`(VS Code);面向新平台/CLI → 不放 mode 目录,靠 description 区分场景。
- [ ] 想覆盖全局技能 → 项目 `.kilocode/skills/` 同名即可。
- [ ] symlink 共享 → `name` 用链接名。
- [ ] 写完 reload VS Code / 重启 CLI,再到 Output("Kilo Code")确认无加载错误。
- [ ] 团队分发把 `.kilocode/skills/` 提交进仓库;个人通用放 `~/.kilocode/skills/`。
- [ ] 跨厂商可移植写法与 Roo Code 一致:标准主干 + 可选 mode 变体。

## 6. 与标准基线差异速查

| 维度 | agentskills.io 基线 | Kilo Code(VS Code) |
|---|---|---|
| mode 绑定 | 无 | `skills-{mode}/` 目录后缀(与 Roo 同风格) |
| 同名覆盖 | 未规定 | 项目>全局;mode>generic |
| name 校验 | 建议 | 严格:须等于目录名;无首尾连字符 |
| symlink | 未涉及 | 支持,须匹配链接名 |
| 版本刷新 | 无 | 新平台 skill 对象含 `version` 字段 |
| 调试 | 无 | Output 面板 "Kilo Code" + 常见错误表 |
