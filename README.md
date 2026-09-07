# Agent Skill Dialects

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Chinese](https://img.shields.io/badge/lang-Chinese-blue.svg)](README-zh.md)
[![CI](https://github.com/HuaTalk/agent-skill-dialects/actions/workflows/test.yml/badge.svg)](https://github.com/HuaTalk/agent-skill-dialects/actions/workflows/test.yml)

**Same SKILL.md, different vendor dialects.**

Agent Skill Dialects is a local, offline reference for how each AI coding agent implements or extends the [agentskills.io](https://agentskills.io) open format. One standard skill file behaves differently per vendor: field defaults, aliases, skip-or-silent-failure rules, directories and scope, and invocation mechanics. The reference ships as a context-pointer skill: the SKILL.md only routes; the per-vendor detail loads on demand from `references/`.

Use it when you write one portable SKILL.md that must run on several vendors, or when you port an existing skill and need to know whether a field will be honored, aliased, ignored, or rejected — without fetching vendor docs every time.

## Quickstart

The fastest way to make the reference available to your agent:

```bash
npx skills add HuaTalk/agent-skill-dialects
```

For Claude Code, register the repository as a plugin marketplace and install the plugin:

```text
/plugin marketplace add https://github.com/HuaTalk/agent-skill-dialects.git
/plugin install agent-skill-dialects@agent-skill-dialects
```

Then ask your agent a question such as:

```text
I am about to write a SKILL.md for both Claude Code and Kimi Code.
Check the agent-skill-dialects reference and list which of my fields would be skipped or rejected.
```

The agent routes to the vendor documents, reads only the ones it needs, and walks the adaptation checklists.

## How It Works

Agent Skills use progressive disclosure: discovery loads only `name`/`description`, invocation loads the matched SKILL.md body, and resources load on demand. Packing every vendor into one file would waste context. Instead:

- `SKILL.md` keeps the routing table, portable-authoring rules, and a key-difference cheat sheet.
- Each vendor has one file under `references/<vendor>.md` with the same template: positioning, directories and scope, frontmatter and vendor extensions, loading and invocation, an adaptation checklist, and differences from the baseline.
- Every document states its check date and official sources. Facts that could not be verified verbatim are labeled as such (for example the JetBrains Junie page currently returns 403) and listed in [Updating](#updating).

## Installation

### npm

```bash
npm install -D @huatalk/agent-skill-dialects
```

The package ships `skills/agent-skill-dialects/` plus the docs; installers such as `skills-npm` can wire the skill directory into each agent.

### Agent Skills (`npx skills`)

```bash
npx skills add HuaTalk/agent-skill-dialects
```

Compatibility and the install location are determined by the installer and each agent's Skill implementation (Codex, Cursor, Windsurf, Gemini CLI, GitHub Copilot, Cline, and others).

### Claude Code plugin

```text
/plugin marketplace add https://github.com/HuaTalk/agent-skill-dialects.git
/plugin install agent-skill-dialects@agent-skill-dialects
```

Restart Claude Code after installation; the plugin command is `/agent-skill-dialects`.

> ⚠️ The distribution commands above (`npx skills add`, the marketplace install, and the plugin command name) are pending live verification before the first release.

### Manual copy or symlink

Copy (or symlink) the whole `skills/agent-skill-dialects/` directory into the skill root of the target vendor:

```bash
ln -s $PWD/skills/agent-skill-dialects ~/.kimi-code/skills/agent-skill-dialects   # Kimi Code CLI
ln -s $PWD/skills/agent-skill-dialects ~/.claude/skills/agent-skill-dialects      # Claude Code
ln -s $PWD/skills/agent-skill-dialects ~/.agents/skills/agent-skill-dialects      # Codex / OpenHands / ...
ln -s $PWD/skills/agent-skill-dialects ~/.traecli/skills/agent-skill-dialects     # Trae CLI
ln -s $PWD/skills/agent-skill-dialects ~/.kilocode/skills/agent-skill-dialects    # Kilo Code
ln -s $PWD/skills/agent-skill-dialects ~/.roo/skills/agent-skill-dialects         # Roo Code
ln -s $PWD/skills/agent-skill-dialects ~/.junie/skills/agent-skill-dialects       # JetBrains Junie
```

Do not break the pairing between `SKILL.md` and its `references/` folder. After installing, follow the vendor's activation rules (a new session; Trae CLI and Kilo Code may require a restart or a window reload) and verify with the vendor's skill listing command.

## What's Inside

A single context-pointer skill plus a 16-vendor (and one baseline) corpus:

| Target / product | Reference document |
|---|---|
| Baseline: what the standard defines | `skills/agent-skill-dialects/references/00-standard-baseline.md` |
| Anthropic Claude Code | `skills/agent-skill-dialects/references/anthropic-claude-code.md` |
| Moonshot Kimi Code CLI | `skills/agent-skill-dialects/references/moonshot-kimi-code.md` |
| OpenAI Codex / ChatGPT | `skills/agent-skill-dialects/references/openai-codex.md` |
| Alibaba Qwen Code | `skills/agent-skill-dialects/references/alibaba-qwen-code.md` |
| Anysphere Cursor | `skills/agent-skill-dialects/references/cursor.md` |
| GitHub Copilot (VS Code / CLI / Cloud) | `skills/agent-skill-dialects/references/github-copilot.md` |
| Google Gemini CLI | `skills/agent-skill-dialects/references/gemini-cli.md` |
| Windsurf | `skills/agent-skill-dialects/references/windsurf.md` |
| Roo Code | `skills/agent-skill-dialects/references/roo-code.md` |
| Cline | `skills/agent-skill-dialects/references/cline.md` |
| OpenHands | `skills/agent-skill-dialects/references/openhands.md` |
| Trae IDE / Trae CLI | `skills/agent-skill-dialects/references/trae.md` |
| JetBrains Junie | `skills/agent-skill-dialects/references/jetbrains-junie.md` |
| Kilo Code | `skills/agent-skill-dialects/references/kilo-code.md` |
| Continue CLI | `skills/agent-skill-dialects/references/continue.md` |
| Aider (no native support; migration path) | `skills/agent-skill-dialects/references/aider.md` |

The cross-vendor conclusions and comparison matrix live in [Overview](docs/en/overview.md); design rationale in [Design](docs/en/design.md); maintenance conventions in [Maintenance](docs/en/maintenance.md). The Chinese documents (`docs/zh/`) are the authoritative source content.

## Philosophy

- **Standard first, extensions labeled.** A portable trunk uses only `name`/`description` and Markdown body. Vendor fields are enhancements — and the docs tell you how a migrating skill would fail (Kimi skips unknown `type` values, Qwen rejects an invalid `name` at parse time, Copilot silently does not load it).
- **Verifiable facts only.** Every document carries a check date and official sources. Unverifiable entries are marked, never invented.
- **Dialects, not ecosystems.** The reference frames vendors as variants of one format, which makes per-vendor differences and "who behaves like whom" (Kilo and Roo both use `skills-{mode}`) easy to compare.

## Validation and Limitations

- Repository checks (`npm test`) verify version consistency, that the SKILL.md mapping table and `references/` match one-to-one (single-level), header invariants per document, balanced code fences, that local links resolve and the npm package covers every file the shipped docs link, and that English docs stay English-only.
- The corpus is a snapshot with a check date, not a live mirror. Vendors change behavior; see [Updating](#updating) and [Maintenance](docs/en/maintenance.md).
- This project does not implement vendor-native capabilities (flow execution, parent/child bundles) and is not a substitute for the agentskills.io specification or general skill-authoring guidance.

## Updating

Vendor behavior changes. Suggested cadence: review every 1–3 months, or immediately after a vendor release that changes skill behavior. Known follow-ups as of 2026-09-07: the JetBrains Junie skills page returns 403 (backed by the official blog and JetBrains Air Help until reachable), Continue CLI has no standalone skills docs page yet (based on PR #9696), Kilo Code's VS Code extension and "new platform" diverge on mode directories, and Kimi Code maintains two doc generations (`~/.kimi-code/` vs `~/.kimi/`). See [Maintenance](docs/en/maintenance.md) for the full list and procedure.

## Contributing

Content contributions, fact corrections with official sources, and new vendor documents are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md) for the repository layout, language conventions, and the release process.

## License

[MIT](LICENSE)
