# Design: dialects, a context pointer, and verifiable corpus

The same standard SKILL.md (agentskills.io `name` + `description` + Markdown body) is interpreted differently by each coding agent: field defaults, aliases, whether invalid values are skipped or rejected, directories and scope, explicit invocation syntax, auto-trigger switches, and distribution. We call these differences "dialects". The skill was temporarily named `provider-enhanced-skill`; the final name `agent-skill-dialects` says that this is about agent skills, framed as dialects of one format, used as a look-up for portable skill authors.

## Why a context pointer

Agent Skills use progressive disclosure: discovery loads only `name`/`description`; invocation loads the matched SKILL.md body; resources load on demand. Packing 16 vendors into one SKILL.md would waste context. So:

- `SKILL.md` keeps only the routing table, portable-authoring guidelines, and a key-difference cheat sheet (~70 lines).
- Each vendor gets one `references/<vendor>.md`; only the matched vendor is read.
- Authoring order is fixed: read `00-standard-baseline.md` first, then the target vendor, then walk its adaptation checklist.

## Why documents share one template

Every vendor document uses the same skeleton (positioning -> directories and scope -> frontmatter and vendor extensions -> loading and invocation -> adaptation checklist -> differences from the baseline). That keeps answers comparable across vendors ("what happens when `name` is invalid?"), machine-checkable (see `scripts/check-skill-contract.js`), and extensible: adding a vendor means cloning the template and adding one mapping row.

## Content principles

- Facts must be verifiable: every document carries a check date and official sources. When verbatim text is unavailable (for example the Junie page returns 403), state the supporting sources and mark the entry "to be re-checked"; never invent fields.
- Standard first, extensions labeled: portable trunks use only standard fields; vendor fields are described as enhancements, including how a migrating skill would fail (Kimi skips unknown `type` values; Qwen rejects invalid `name` at parse time; Copilot silently fails to load).
- Difference directions: invocation control, runtime shapes (fork / flow / mode directories), distribution (plugin / marketplace / skill installers), lifecycle (`/learn`, `/curator`, `/create-skill`), and UI metadata (`icon`, `color`).
- Interop hints matter: note who behaves like whom (Kilo and Roo both use `skills-{mode}`; OpenHands and Qwen both gate on `paths`).

## Boundaries

Not a runtime rule engine, not a reimplementation of vendor-native features, not an exhaustive per-field compatibility matrix, and not a substitute for the agentskills.io specification or general skill-authoring guidance. The repository mirrors the `hiding-skill` repo design (skill definition + npm/Claude marketplace distribution + static contract checks + bilingual top-level docs) with different content: hiding cleans files, this reference answers "check the dialect before you adapt".
