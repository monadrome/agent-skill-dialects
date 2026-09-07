# 维护约定与已知待补项

本仓库的价值来自"事实新鲜 + 可溯源"。厂商行为会变,以下约定用于让语料长期可用。

## 复核节奏

- 建议每 1–3 个月复核一次;厂商发布涉及技能行为(major/破坏性)的变更时立即复核。
- 复核入口:每个 `skills/agent-skill-dialects/references/<vendor>.md` 顶部的「核对日期 + 官方来源」。
- 复核动作:重开官方 URL,逐条确认默认值/别名/跳过或拒绝规则/目录与 scope;变更后把「核对日期」改为当天;URL 失效则换新并记录。

## 破坏性变更标注

厂商删除/改名某字段、改变默认值或非法值处理时:

1. 在对应 references 文档显著标注,如 `⚠️ 破坏性变更:自 vX.Y 起 …`;
2. 更新 `docs/zh/overview.md` 的结论摘要与对比矩阵;
3. 在 CHANGELOG 记一笔(用户可见行为变化)。

## 待复核清单(2026-09-07 核对日)

| 条目 | 状态 | 复核要点 |
|---|---|---|
| JetBrains Junie 官方技能页 `junie.jetbrains.com/docs/agent-skills.html` | 直连 403 | 页面可访问后,核对 frontmatter 字段表是否有标准之外的扩展;当前以官方博客 + Air Help 佐证 |
| Continue CLI Skills | 官方文档尚无独立页 | 以 PR #9696 为准;官方 Skills 页落位后整体换源 |
| Kilo Code 新旧平台 | VS Code 扩展与"新平台"分叉 | 跟踪官方文档是否收敛(新平台不再用 `skills-{mode}/`) |
| Kimi Code 新旧文档 | `kimi.com` 新版与 `kimi-cli.com` 旧版并存 | 旧版用户目录 `~/.kimi/`、新版 `~/.kimi-code/`,确认合并读取行为 |

## 新增/变更厂商的完整动作

1. 新建或修改 `references/<vendor>.md`(文件头三行齐全);
2. `SKILL.md` 映射表加一行,并同步「关键差异速查」相关行;
3. `README.md` 与 `README-zh.md` 的目录树/厂商表同步;
4. `docs/zh/overview.md`(及英文摘要)同步对比矩阵;
5. `npm ci && npm test` 通过;
6. `CHANGELOG.md` 记录。

## 官方来源索引

所有官方 URL 都写在每个 references 文件头部,不在此重复维护,避免双份来源漂移。标准本身的权威入口:

- agentskills.io 规范:https://agentskills.io(specification / skill-creation / best-practices)
