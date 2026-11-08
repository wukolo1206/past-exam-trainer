# AGENTS.md — past-exam-trainer

## 開始前必讀

1. 讀本資料夾 `CLAUDE.md`，確認架構、部署方式、不能動的地方與驗證清單。
2. 讀本資料夾 `handoff.md`，確認上一個 session 停在哪裡。
3. 遵守 `D:\備課ai\AGENTS.md` 與上層 `D:\備課ai\30_康軒數學\AGENTS.md` 的全域規則。

## 專案定位

- 這是獨立 GitHub repo：`https://github.com/wukolo1206/past-exam-trainer`
- 正式網站：`https://wukolo1206.github.io/past-exam-trainer/`
- 技術：純 HTML + Tailwind CDN + 原生 JS，搭配 GAS 後端與 Google Sheets

## 修改規則

- 修改既有程式碼檔前，先覆蓋同目錄 `.bak` 備份。
- 不要在未確認欄位用途前修改 GAS 寫入 Google Sheets 的欄位。
- 不要把其他未追蹤檔案混進 commit；提交前一定看 `git status -sb`。
- 若只是調整 UI，優先保持純 HTML/Tailwind，不新增建置流程。

## 做完一件事的當下就更新（不要等收工）

依序更新：

1. `CLAUDE.md` frontmatter：`status`、`version`、`next_action`、`updated`
2. `handoff.md`
3. `CHANGELOG.md`，若完成明確功能或部署
4. `PITFALLS.md`，若修復非顯而易見的 bug 或發現未修風險
5. `DECISIONS.md`，若做出非顯而易見的架構決策

## 使用者說「收工」時：四件事，缺一不可

**這不是「更新文件」清單。第 1 和第 4 項不是文件，卻最常被漏掉。**

**1. `git commit`（最常被漏掉的一件）**

```bash
git status --short          # 有東西就代表要 commit
git add -A
git commit                  # 訊息寫清楚做了什麼
```

**commit 一律做，不需要問使用者。push 才要先問。** 這兩件事不同。
（這個資料夾若不是 git repo，本項跳過。）

> 2026-09-10 的教訓：某個專案一整天 2300 行改動全部只躺在工作區，
> 因為當時的收工流程裡沒有這一條。

**2. frontmatter** — 更新專案 `CLAUDE.md`（沒有就找 `AGENTS.md`）頂端 `---` 區塊的
`status` / `version` / `next_action` / `updated` 四欄，不動其他內容。檔案維持 UTF-8 無 BOM。

**3. `handoff.md`** — 停在哪、本次驗證了什麼、下次接續什麼、有什麼地雷。

**4. 執行備份腳本（整台電腦一次，不是每個專案一次）**

```
G:\我的雲端硬碟\AI設定同步\收工.bat
```

它備份 `C:\Users\wu\` 底下的 AI 設定、記憶與憑證 — 那些雲端硬碟碰不到，
不跑這步，換到另一台電腦就沒有。跑完要等 Google 雲端硬碟顯示「已完成同步處理」。

**換到另一台電腦開工前**，該台先跑 `G:\我的雲端硬碟\AI設定同步\開工.bat`。

若同一次動到多個專案，第 1～3 項每個專案各做一次，第 4 項整台只做一次。

