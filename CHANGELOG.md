# CHANGELOG — past-exam-trainer

## @2026-05-26 — 子專案文件初始化

- 新增本子專案自己的 `CLAUDE.md`、`AGENTS.md`、`CHANGELOG.md`、`PITFALLS.md`、`DECISIONS.md`、`handoff.md`
- 將部署方式、不能動的地方、驗證清單與目前交接狀態收斂到 `past-exam-trainer/` 內

## @2026-05-26 — 寬版介面調整

- 放寬首頁、測驗、結果、紀錄與教師頁的桌機版內容寬度，減少畫面集中在中間的問題
- 首頁在桌機版改成兩欄設定卡，手機版維持原本單欄操作
- 測驗頁加大題幹、選項、導覽按鈕與卡片內距，提升投影與大螢幕可讀性
- 已 push commit `4d050b8` 到 GitHub `main`

## @2026-05-26 — 出卷工具與評量向度資料

- 新增 `exam-builder.html` 出卷工具，支援篩選題目、勾選題目、列印、Word、PDF 輸出
- `teacher.html` 新增出卷入口
- 題庫資料補入 `assessment_domain` 與 `assessment_type`，供出卷與分析使用
