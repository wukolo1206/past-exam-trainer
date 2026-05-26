# AGENTS.md — past-exam-trainer

## 開始前必讀

1. 讀本資料夾 `CLAUDE.md`，確認架構、部署方式、不能動的地方與驗證清單。
2. 讀本資料夾 `handoff.md`，確認上一個 session 停在哪裡。
3. 遵守 `D:\備課ai\AGENTS.md` 與上層 `D:\備課ai\三下數學\AGENTS.md` 的全域規則。

## 專案定位

- 這是獨立 GitHub repo：`https://github.com/wukolo1206/past-exam-trainer`
- 正式網站：`https://wukolo1206.github.io/past-exam-trainer/`
- 技術：純 HTML + Tailwind CDN + 原生 JS，搭配 GAS 後端與 Google Sheets

## 修改規則

- 修改既有程式碼檔前，先覆蓋同目錄 `.bak` 備份。
- 不要在未確認欄位用途前修改 GAS 寫入 Google Sheets 的欄位。
- 不要把其他未追蹤檔案混進 commit；提交前一定看 `git status -sb`。
- 若只是調整 UI，優先保持純 HTML/Tailwind，不新增建置流程。

## 結束時

依序更新：

1. `CLAUDE.md` frontmatter：`status`、`version`、`next_action`、`updated`
2. `handoff.md`
3. `CHANGELOG.md`，若完成明確功能或部署
4. `PITFALLS.md`，若修復非顯而易見的 bug 或發現未修風險
5. `DECISIONS.md`，若做出非顯而易見的架構決策
