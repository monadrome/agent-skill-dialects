# Vendor support for Agent Skills: overview

> Research date: 2026-09-07. Per-fact detail lives in `skills/agent-skill-dialects/references/` (each file carries its own check date + official sources); this page is the cross-vendor conclusions and matrix. Chinese is the authoritative version: `docs/zh/overview.md`.

## Conclusions

1. **The interop layer is de facto standardized.** A SKILL.md with `name`/`description` frontmatter and a Markdown body (the agentskills.io open format, initiated by Anthropic) is the industry baseline; OpenAI also declares the same standard.
2. **Two "generic directories" are the interop hubs.** `~/.agents/skills` and `.claude/skills` are read by most vendors (Codex, Kimi, Gemini, Cursor, Copilot, Windsurf, Roo, ...).
3. **Everything beyond the standard is vendor extension.** Extensions cluster into five directions: invocation control (`user-invocable`, `disable-model-invocation`, `allowed-tools`), runtime shape (fork sub-agent / flow / mode binding), distribution (plugin / marketplace), lifecycle (`/learn`, `/curator`, `/create-skill`), and UI metadata (`icon`, `color`, `metadata`).
4. **"Deterministic injection" is a growing direction.** OpenHands declares `triggers:` (keyword-match injection; the skill stays model-invocable) and `paths:` (file-match rule injection; **not** advertised in `<available_skills>`, not model-invocable); together with `paths` in Qwen and Cursor, the industry is moving from "the model chooses a skill" toward keyword/file-level automatic activation.
5. **Parent-child skill nesting is not part of the open standard**, and its meaning differs per vendor: Kimi Code `has-sub-skill` is the only functional parent/child bundle (aggregation + qualified-name loading); Claude's qualified names (`apps/web:deploy`) are namespaces without aggregation; Cursor's recursive nesting is officially "organizational only"; Roo's override chain is same-name overriding, not parent/child aggregation.

## Support table (directory / scope)

| Vendor | Primary directories | Interop directories / notes |
|---|---|---|
| Claude Code | enterprise > `~/.claude/skills` > `.claude/skills` > plugin skills | also reads `.claude/commands` |
| OpenAI Codex | `/etc/codex/skills` > `~/.agents/skills` > `.agents/skills` up from CWD | standard dir is `.agents/skills` |
| Kimi Code CLI | project > user `~/.kimi-code/skills` > extra > built-in; multi-brand merge by default | `.claude/skills`, `.codex/skills`, `.agents/skills` |
| Gemini CLI | built-in > `~/.gemini/skills` > workspace `.gemini/skills` | aliases `~/.agents/skills`, `.agents/skills` |
| Qwen Code | `~/.qwen/skills`, `.qwen/skills` | external dirs incl. `.agents/skills` |
| Cursor | `~/.cursor/skills`, `.cursor/skills` | `.agents/skills`, `.claude/skills`, `.codex/skills` |
| GitHub Copilot | `~/.copilot/skills` > `.github/skills` | `.claude/skills`, `.agents/skills`; extensions via `chatSkills` |
| Windsurf | `~/.codeium/windsurf/skills`, `.windsurf/skills` | `.agents/skills`; optional `.claude/skills` |
| Roo Code | `~/.roo/skills`, `.roo/skills` | `.agents/skills` (`.roo/` wins per scope level) |
| Cline | `~/.cline/skills`, `.cline/skills` | `.clinerules/skills`, `.claude/skills` |
| Trae | IDE `.trae/skills` + `~/.trae-cn/skills`; CLI `.traecli/skills` + `~/.traecli/skills` | CLI also reads the IDE skill directories |
| JetBrains Junie | `~/.junie/skills`, `.junie/skills` | shared `.agents/skills` in JetBrains Air |
| Kilo Code | `~/.kilocode/skills`, `.kilocode/skills` + `skills-{mode}/` | new platform/CLI uses a shared pool |
| OpenHands | project `.agents/skills` > user `~/.agents/skills` > public registry | legacy `.openhands/skills/`, `.openhands/microagents/` kept |
| Continue (CLI) | `.continue/skills`, `$CONTINUE_HOME/skills` | `.claude/skills` compat; built-in Skills tool |
| Aider | none (no native SKILL.md) | migrate to `CONVENTIONS.md` + `read:` |

## Extension depth ordering

1. **Near-pure standard (restrained):** Gemini CLI, Windsurf, Cline, Trae, Junie, Continue.
2. **Standard + invocation control / auto-injection:** GitHub Copilot, Qwen Code, OpenHands (`triggers`/`paths`), Claude Code (`allowed-tools`, `context: fork`).
3. **Deep extensions:** Cursor (nesting is organizational only), Kilo Code and Roo Code (`skills-{mode}` directories + override chains), Kimi Code (`type: prompt|inline|flow`, `has-sub-skill` parent/child bundles, `$KIMI_SKILL_DIR`, `/skill:` and `/flow:`).
4. **Special positions:** OpenAI Codex (extension lives in the distribution layer); Aider (no native support; bridge to conventions files).

## Field matrix highlights

| Field / mechanism | Claude | Kimi | Codex | Gemini | Qwen | Cursor | Copilot | Roo |
|---|---|---|---|---|---|---|---|---|
| `user-invocable` | yes | - | - | - | yes | - | yes | - |
| `disable-model-invocation` | yes | yes | - | - | yes | yes | yes | - |
| `allowed-tools` | yes | - | - | - | - | - | - | - |
| `context: fork` | yes | - | - | - | - | - | yes | - |
| `type: flow` | - | yes | - | - | - | - | - | - |
| `has-sub-skill` | - | yes | - | - | - | - | - | - |
| `paths` (glob gating) | - | - | - | - | yes | yes | - | - |
| mode dirs (`skills-{mode}`) | - | - | - | - | - | - | - | yes |

Vendor-only mechanisms are covered in the reference files: OpenHands `triggers:`/`paths:`, Kilo mode directories, Trae name fallback to the directory name, Continue's built-in Skills tool, Aider's migration path, and so on.
