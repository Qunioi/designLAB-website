# AGENTS.md — Design LAB 專案規則

給在這個專案工作的 AI 助理與新成員。專案介紹、架構與部署見 [README.md](README.md)；設計系統完整規格與元件參數見設計規劃頁面：<https://claude.ai/code/artifact/b66cc05f-1401-490f-9b9f-cad8c86dea20>。

## 溝通

- 一律用繁體中文（台灣）回覆與撰寫註解；指令、檔名、API 名稱保留原文。
- 不確定需求時先詢問，不要自行猜測後大改。
- 完成後列出修改了哪些檔案、做了什麼、怎麼驗證的；沒驗證到的地方要明說。

## 基本原則

- 使用 Vue 3（`<script setup>`）＋ Vite，不任意新增或更換套件。
- 修改前先閱讀相關檔案；一次只改被指定的範圍，不順手重構無關的程式。
- 保留目前的頁面結構與既有功能，不要刪除功能。要移除東西（包括看起來沒用到的元件）先確認。
- 桌機與手機都要能用：照 5 級斷點檢查，觸控裝置可點區域至少 44px。
- 「優化提案」頁（`#/proposals`）維持從選單隱藏，但路由與功能保留。
- `apps-script/Code.gs` 是伺服器端信任邊界，沒有明確要求時不要修改。

## 設計系統（定案，新畫面照做）

**不要寫死數值。** 顏色、圓角、間距、字級、陰影、動畫時長、z-index 都用 `src/styles/tokens.css` 的 token。

- **主題顏色維持原樣**：8 套主題的主色是定案，不要為了對比度調色，也不要再提議替代的文字色 token。
- **陰影**：只有 hover 帶主色光暈（`--shadow-hover`）；靜止、下拉、彈窗一律中性灰。
- **顏色**：元件引用語意 token（`--surface-*`、`--text-*`、`--action-*`、`--scrim`）；疊在圖片或影片上用 `--media-shade`／`--on-media` 系列。
- **字級**：只用 7 個角色 token：`--fs-page-title`、`--fs-section-title`、`--fs-lightbox-title`、`--fs-card-title`、`--fs-body`、`--fs-meta`、`--fs-meta`；`--fs-badge`（10px）只給數字徽章。
- **間距**：區塊之間 `--space-section`、區塊內堆疊 `--space-stack`、標題到內容 `--space-heading`、網格 `--grid-gap`；兄弟元素之間用父層 `gap`，不用零碎 margin。
- **圓角**：`--radius-xs / sm / md / lg / xl / 2xl / full`。
- **動態**：時長用 `--dur-*`、緩動用 `--ease-*`；只動 `transform`／`opacity`，不要 `transition: all`；離場比進場快；尊重 `prefers-reduced-motion`；hover 不放大按鈕或圖示。
- **層級**：只用 `--z-*`（元件內部排前後的 1–9 可以寫數字）。
- **斷點**：只用 5 級：`min-width: 1920px`、`max-width: 1359px`、`max-width: 1023px`、`max-width: 640px`，極窄兩欄改一欄才用 480；觸控用 `@media (pointer: coarse)`；放在不同容器裡的元件用 `@container`。

## 元件（優先組合，不要重刻）

共用元件在 `src/components/base/`：

- 按鈕：`BaseButton`（文字按鈕）、`IconButton`（只有圖示，`label` 必填）、`CloseButton`（彈窗右上關閉）。
- 圖示：`<Icon name="…" />`；新圖示加到 `base/icons.js`，不要在模板裡內嵌 SVG。
- 表單：`FormField` 包每一個欄位（label 一定要關聯到欄位）、`Select` 取代原生 `<select>`、`SearchInput`、`Dropdown`。
- 浮層：所有彈窗用 `BaseModal`；「從卡片裡挑」用 `MediaPickerModal`；確認用 `await confirmDialog()`；提示用 `toast`。**不要用瀏覽器原生的 `alert`／`confirm`**。
- 內容：`ContentCard`、`SelectCard`、`CardGrid`、`EmptyState`、`SectionBlock`、`Chip`。
- 殼層：`layout/AppShell`；主題選擇：`ThemePicker`。

**已定案的互動規則**

- 新增／編輯表單：點遮罩、按 Esc 都**不關閉**，只能按「取消」或右上關閉鈕；燈箱與其他瀏覽用的彈窗，點遮罩可以關閉。
- 有儲存動作的按鈕：送出期間顯示載入狀態並停用，成功或失敗後恢復。
- 表單必填：標題、類型、封面圖必填，動態研究另外必填影片；其餘欄位（包括所有網址）都是選填。規則集中在 `CRUDModal.vue` 的 `REQUIRED_FIELDS`。
- 管理精選：勾選不立即儲存；有變更才出現「儲存」按鈕，放棄變更前要先確認。
- 訪客看不到通知鈴；畫面上 Super Admin 一律顯示為「Admin」，但保留 Super Admin 的功能；新增成員的身分選單只有 User 與 Admin。

## 無障礙

- 可點的東西用真正的 `<button>` 或 `<a>`，不要在 div 上加 `tabindex`；卡片整張可點時用 `.card-hit`。
- 只有圖示的按鈕一定要有報讀名稱；焦點外框不能被 `outline: none` 蓋掉。
- 彈窗打開時焦點進入彈窗、關閉後還給原本的按鈕（`BaseModal` 已處理）。

## 建置與驗證

- 改完原始碼一定要執行 `npm run build`。`dist/index.html` 引用的檔名帶雜湊值，**不要只還原 `dist/index.html`**，否則整頁找不到 JS／CSS。
- 建置後確認 `dist/index.html` 引用的檔案都存在。
- 用瀏覽器（例如 Playwright）驗證時，**不要寫入正式資料**：擋掉所有非 GET 請求，需要登入畫面時用假的本機身分；刪除類的確認對話框只按取消。
- 本機預覽：`http://localhost/designLAB-website/dist/`（Apache 直接提供 `dist/`），或 `npm run dev`（http://localhost:5173）。
- 目前沒有自動化測試與 lint；Safari 無法用 Playwright 驗證，涉及版面的改動要提醒使用者手動看一次。

## 測試與驗收規則

- 目前專案沒有完整自動化測試。
- 修改功能後，優先使用 Playwright 測試 Chrome。
- Playwright 無法完全代表真實 Safari。
- 只要涉及版面、字體、間距、動畫或 RWD，完成後必須提醒使用者手動檢查 Safari。
- 不要宣稱已完成 Safari 驗證，除非使用者實際在 Safari 開啟確認。
- 修改完成後，執行 lint 或至少檢查 Console 錯誤。
- 每次修改後列出測試結果與尚未驗證的項目。



## 程式碼註解規則

- 不要為每次修改新增註解。
- 不要加入 AI 修改紀錄或區塊裝飾註解。
- 只保留複雜邏輯、瀏覽器限制、第三方限制與跨檔案依賴。
- 註解應說明「為什麼」，不要重複說明「程式碼正在做什麼」。
- 修改完成後不要在程式碼中留下工作過程備註。