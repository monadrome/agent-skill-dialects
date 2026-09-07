# Changelog

本项目的版本号遵循 [Semantic Versioning](https://semver.org/)。变更按 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 编写。

版本号同时存在于三处并保持一致:`.claude-plugin/plugin.json`、`package.json`、`skills/agent-skill-dialects/SKILL.md` 的 `metadata.version`。

## [Unreleased]

### Added

- 初始技能 `agent-skill-dialects`:上下文指针型 SKILL.md(路由表 + 通用可移植准则 + 关键差异速查),正文只路由、细节按需加载。
- 参考语料 `references/`:开放标准基线 + 16 家厂商/专题文档,同构格式(定位 / 目录与作用域 / frontmatter 与厂商扩展 / 加载与调用 / 适配清单 / 与标准差异速查),每家带「核对日期 + 官方来源」。
- 覆盖厂商:Claude Code、Kimi Code CLI、OpenAI Codex、Qwen Code、Cursor、GitHub Copilot、Gemini CLI、Windsurf、Roo Code、Cline、OpenHands、Trae、JetBrains Junie、Kilo Code、Continue、Aider。
- 发行渠道:npm 包(`@huatalk/agent-skill-dialects`)+ Claude Code plugin marketplace + `npx skills` 安装。
- 静态契约校验:`scripts/check-versions.js`(三处版本一致 + tag 对齐)、`scripts/check-skill-contract.js`(映射表 ↔ references、头三行、围栏、语言分区、本地链接)。
- CI:`test.yml`(push/PR/tag 跑契约校验与 `npm pack --dry-run`)、`publish.yml`(tag 触发发布,支持 NPM_TOKEN 与 Trusted Publisher 两条路径)。
- 双语文档骨架:`README.md`(英文)与 `README-zh.md`(中文);`docs/en/` 与 `docs/zh/`(overview / design / maintenance)。
