# DECISIONS — past-exam-trainer

## 子專案文件獨立化

**選擇：** 在 `past-exam-trainer/` 內建立獨立的 `CLAUDE.md`、`AGENTS.md`、`CHANGELOG.md`、`PITFALLS.md`、`DECISIONS.md`、`handoff.md`。
**原因：** `past-exam-trainer` 是獨立 GitHub repo 與獨立 GitHub Pages 網站，若仍只記在上層 `三下數學` 文件，容易與 `knowledge-map`、`circle-game` 等子專案混淆。
**棄選方案：** 只維護上層 `三下數學` 文件；此做法會讓部署紀錄、踩坑與交接混在一起，不利於獨立 repo 的 commit/push。
**生效版本：** 2026-05-26
