---
project: past-exam-trainer
category: 學科工具集
status: 維護中
version: "110年六年級題目補完 2026-05-27"
url: https://wukolo1206.github.io/past-exam-trainer/
next_action: 線上驗證 110 六年級圖片題顯示正常，再進行指標精修
updated: 2026-05-27
---

# CLAUDE.md — past-exam-trainer

國小數學學力檢測考古題練習工具。這是獨立 GitHub repo，部署到 GitHub Pages，並使用 GAS 後端記錄作答資料與教師分析資料。

## 技術框架

- 純 HTML + Tailwind CSS CDN + 原生 JavaScript
- GitHub Pages 靜態部署
- GAS 後端：`gas/Code.gs`
- 題庫資料：優先由 GAS `action=questions` 讀取，失敗時 fallback 到 `data/questions.json`
- 圖片題資源：`img/`，命名格式多為 `年級_題號` 組合，例如 `114_3_q02.png`

## 主要頁面

- `index.html`：入口設定，選班級、姓名、年級、出題方式與題數
- `quiz.html`：逐題作答、即時回饋、可前後切題
- `result.html`：得分、指標分析、送出 GAS 紀錄
- `record.html`：學生個人紀錄與錯題查詢
- `teacher.html`：教師 Dashboard，含指標熱圖、難題列表、班級矩陣與 CSV
- `exam-builder.html`：教師出卷工具，支援篩選題目與列印/Word/PDF 輸出

## 部署

- GitHub repo：https://github.com/wukolo1206/past-exam-trainer
- GitHub Pages：https://wukolo1206.github.io/past-exam-trainer/
- 部署方式：commit 後 push 到 `main`，等待 GitHub Pages 同步

## 不能動的地方

- `GAS_URL` 常數：改動前要確認 GAS 部署網址是否同步更新。
- `gas/Code.gs` 的資料欄位對應：會影響 Google Sheets 寫入與教師 Dashboard。
- `data/questions.json` 題庫結構：會影響出題、作答、結果分析、出卷工具。
- `img/` 圖片檔名：題目圖片依資料欄位組合路徑，改名會造成圖片失效。
- `.bak` 檔：依全域規則作為修改前備份，除非明確整理備份策略，不要任意刪除。

## 部署後驗證清單

- 開啟 `https://wukolo1206.github.io/past-exam-trainer/`，確認首頁可載入。
- 首頁桌機版確認內容不再窄縮集中於中央，手機版仍維持單欄。
- 選擇班級、姓名、年級、出題方式、題數後可進入 `quiz.html`。
- `quiz.html` 題目、圖片題、選項、上一題/下一題/提交可正常操作。
- `result.html` 可顯示分數與指標分析。
- `record.html` 可查詢學生紀錄。
- `teacher.html` 可載入班級 Dashboard，CSV 匯出可用。
- `exam-builder.html` 可篩選題目，並測試列印、Word、PDF 輸出。

## 目前注意事項

- 2026-05-26 已 push 寬版介面調整 commit `4d050b8`，GitHub raw 已更新，但 Pages 檢查時曾仍讀到舊內容，需稍後再確認同步狀態。
- 子 repo 目前曾出現未追蹤備份檔與工具檔，提交前務必用 `git status -sb` 檢查範圍。

