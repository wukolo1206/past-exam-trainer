# PITFALLS — past-exam-trainer

## ⚠️ 已知風險（尚未修復）

- GitHub Pages 可能比 GitHub raw 慢同步；push 後若線上頁面仍是舊版，先用 cache-buster 等待確認。
- 子 repo 內可能有未追蹤 `.bak` 或工具檔；commit 前不要直接 `git add -A`。

---

## 已踩到的坑（新坑加在底部）

## GitHub Pages 同步慢於 raw 檔案

**現象**：push 後 GitHub raw 已看到新版 HTML class，但 `https://wukolo1206.github.io/past-exam-trainer/` 仍回傳舊內容。
**原因**：GitHub Pages 發佈或 CDN 快取尚未同步。
**解法**：先確認 remote `main` 與 raw 檔案，再用 cache-buster 多等幾輪檢查 Pages。
**未來避免**：部署後同時檢查 raw 與 Pages，不要只看其中一邊就判斷完成。

---
