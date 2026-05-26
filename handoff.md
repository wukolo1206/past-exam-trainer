# 工作交接 — 2026-05-26

## 已完成

- 已建立 `past-exam-trainer` 子專案自己的專案文件：
  - `CLAUDE.md`
  - `AGENTS.md`
  - `CHANGELOG.md`
  - `PITFALLS.md`
  - `DECISIONS.md`
  - `handoff.md`
- 已把部署方式、不能動的地方、部署後驗證清單、已知風險、交接狀態寫入本子專案。
- 先前已完成寬版介面調整，並 push 到 GitHub commit `4d050b8`。

## 目前進度

本子專案已具備獨立文件基礎；下一次接手時應優先讀本資料夾文件，不必再從上層 `三下數學` 的混合紀錄中推測狀態。

## 未完成／待確認

- 確認 GitHub Pages 是否已同步寬版介面。
- 決定是否提交並 push 這批新文件。
- 整理目前未追蹤檔案：`add_indicator_unit.py`、`data/questions.json.bak`、`exam-builder.html.bak`、`gas/Code.gs.bak`。

## 下一步

1. 檢查 `https://wukolo1206.github.io/past-exam-trainer/?v=0526` 是否已顯示寬版畫面。
2. 若確認文件內容無誤，將 6 個新 `.md` 檔 stage、commit、push 到 `past-exam-trainer` repo。
3. 檢查未追蹤檔案是否該納入 repo、忽略或刪除。

## 注意事項

- 本次文件初始化未修改任何 HTML、JS、GAS 或資料檔。
- `past-exam-trainer` 是獨立 repo；提交時只處理本資料夾內明確相關的檔案。
- 工作樹已有其他未提交修改，提交文件時不可使用 `git add -A`。
