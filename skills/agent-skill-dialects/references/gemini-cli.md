# Google Gemini CLI

> 核对日期:2026-09-07
> 官方来源:https://geminicli.com/docs/cli/creating-skills/
> 定位:目前最"克制"的标准实现——frontmatter 只要求 `name` + `description`,不引入产品私有控制字段;把 `.gemini/skills` 与 `.agents/skills` 做成等价位。通用技能在 Gemini 上几乎"开箱即用"。

---

## 1. 目录与作用域(优先级从低到高)

| 层级 | 位置 | 说明 |
|---|---|---|
| Built-in | 随 CLI 内置 | 预批准 |
| Extension | 扩展内捆绑 | Gemini CLI 扩展机制 |
| User | `~/.gemini/skills/`(或别名 `~/.agents/skills/`) | 个人 |
| Workspace | `.gemini/skills/`(或别名 `.agents/skills/`) | 项目仓库 |

- `.agents/skills` 是官方认可的**标准互操作别名**,与 agentskills.io 生态打通。
- 自动发现:放对目录即被扫描,无需注册;`/skills` 命令可确认是否已加载。

## 2. frontmatter 与结构

- frontmatter 仅 `name`(建议等于目录名)与 `description`。
- **`description` 被官方标为 CRITICAL**:决定模型何时激活技能,必须写清"处理什么任务 + 触发关键词"。
- 推荐结构:`SKILL.md`(必需)+ `scripts/`、`references/`、`assets/`。技能激活后模型可访问整个技能目录。
- **无**调用开关类扩展字段(`disable-model-invocation` 等在此无标准意义)。

## 3. 调用与分发

- 自动:模型按 description 匹配后**先征求你的许可**再激活(会话内询问)。
- 手动:`/skills` 查看已加载技能;斜杠调用可用性按产品行为。
- 分发:
  - 工作区技能:`.gemini/skills/` 提交进仓库;
  - 扩展捆绑;
  - 独立 git 仓库 + `gemini skills install <url>`。
- 内置 `skill-creator` 元技能:一句需求即可脚手架出 `name`/`description` + `scripts/` `references/` `assets/` 的完整目录。
- 开发辅助(官方核心包自带,便于复用):
  - `node scripts/init_skill.cjs <name> --path <dir>` 初始化
  - `node scripts/validate_skill.cjs <path/to/skill>` 校验
  - `node scripts/package_skill.cjs <path/to/skill>` 打包 `.skill` zip
  - `gemini skills` 子命令支持本地链接(linking)开发

## 4. 适配清单

- [ ] 目录结构用 `<name>/SKILL.md` + `scripts/` 等;放到 `.gemini/skills/` 或 `.agents/skills/`。
- [ ] `description` 写"任务 + 触发关键词",它决定模型是否征求许可激活——写得泛会频繁误触发。
- [ ] 保持纯标准 frontmatter;Gemini 不需要、也不读取各家扩展字段。
- [ ] 需要确定性逻辑时把代码放 `scripts/`,正文指导模型调用。
- [ ] 分发:仓库提交 / `gemini skills install <url>` 两种主流方式。

## 5. 与标准基线差异速查

| 维度 | agentskills.io 基线 | Gemini CLI |
|---|---|---|
| frontmatter 扩展 | — | 无(克制派) |
| 目录别名 | — | `.gemini/skills` ≡ `.agents/skills` |
| 激活 | 按 description | 匹配后征求用户许可再激活 |
| 分发 | 复制目录 | `gemini skills install <url>`、扩展、`.skill` zip 打包 |
| 开发工具 | — | init/validate/package 脚本(官方提供) |
