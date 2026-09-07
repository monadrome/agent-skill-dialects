# Maintenance conventions and known follow-ups

The value of this repository depends on fresh, traceable facts. Vendor behavior changes; these conventions keep the corpus usable.

## Cadence

Review every 1–3 months, or immediately after a vendor release that changes skill behavior (major or breaking). The entry point for each review is the "check date + official sources" header of each file under `skills/agent-skill-dialects/references/`. Re-open every official URL, confirm defaults / aliases / skip-or-reject rules / directories and scope, update the check date, and replace dead URLs.

## Breaking-change labeling

When a vendor removes or renames a field, or changes a default or an invalid-value behavior:

1. Mark the change prominently in the vendor reference (e.g. `⚠️ Breaking change: as of vX.Y …`).
2. Update the conclusions and the comparison matrix in `docs/zh/overview.md`.
3. Add a CHANGELOG entry.

## Known follow-ups (check date 2026-09-07)

| Item | Status | What to verify |
|---|---|---|
| JetBrains Junie official skills page `junie.jetbrains.com/docs/agent-skills.html` | returns 403 | when reachable, verify whether its frontmatter table extends the standard; currently backed by the official blog + JetBrains Air Help |
| Continue CLI Skills | no standalone docs page yet | based on PR #9696; switch the source once an official page lands |
| Kilo Code old vs new platform | VS Code extension vs "new platform" split | track whether docs converge (the new platform drops `skills-{mode}/`) |
| Kimi Code dual docs | new `kimi.com` vs legacy `kimi-cli.com` | confirm merge-all-skills behavior across `~/.kimi-code/` and `~/.kimi/` |

## Steps to add or change a vendor

1. Create or edit `references/<vendor>.md` (header trio required).
2. Add one row to the SKILL.md mapping table.
3. Sync the vendor table in `README.md` and `README-zh.md`.
4. Sync the matrix in `docs/zh/overview.md` and the English summary.
5. `npm ci && npm test` must pass.
6. Record the change in `CHANGELOG.md`.

## Source index

All official URLs live in the header of each reference file; they are not duplicated here to avoid drift. The authoritative entry point for the standard itself is https://agentskills.io (specification / skill-creation / best-practices).
