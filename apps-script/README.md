# Apps Script 後端部署指南

`Code.gs` 是 Design LAB 唯一的伺服器端程式碼。專案沒有其他後端（`api/` 底下的三支
Vercel Functions 只負責 Cloudflare R2 媒體上傳簽章，與帳號、權限無關），所有登入、
密碼與寫入權限的驗證都在這支腳本裡完成。前端的任何檢查都只是畫面呈現，不能取代
這裡的驗證。

部署改用 [`clasp`](https://github.com/google/clasp)（Google 官方 Apps Script CLI）管理，
`Code.gs` 與 `appsscript.json` 是唯一的來源，不再手動複製貼上到線上編輯器。

## 環境需求（一次性）

1. 安裝並登入 `clasp`（用你有這個 Apps Script 專案存取權限的 Google 帳號）：
   ```bash
   npx @google/clasp login
   ```
   會開瀏覽器跳 OAuth 授權，成功後在你的使用者目錄產生 `~/.clasprc.json`
   （全域的登入憑證，不屬於這個 repo，不用管它）。
2. 如果 Google 帳號還沒啟用過 Apps Script API，到
   https://script.google.com/home/usersettings 打開「Google Apps Script API」開關，
   否則 `clasp push`／`clasp deploy` 會回報權限錯誤。

## 首次串接一個既有的 Apps Script 專案

1. 開啟資料來源的 Google Sheets 試算表 → 選單「擴充功能」→「Apps Script」，
   進到專案後從「專案設定」複製 **指令碼 ID (Script ID)**。
2. 在 `apps-script/` 目錄下建立 `.clasp.json`（複製 `.clasp.json.example` 改檔名，
   把 `scriptId` 換成上一步複製的值；這個檔案含環境專屬資訊，已被 `.gitignore`
   排除，不會進版控）：
   ```bash
   cd apps-script
   cp .clasp.json.example .clasp.json
   # 編輯 .clasp.json，貼上實際的 scriptId
   ```
3. 把本機的 `Code.gs` / `appsscript.json` 當作事實來源，推送覆蓋線上專案：
   ```bash
   npx @google/clasp push
   ```
   `clasp push` 只會同步 `.clasp.json` 裡 `rootDir` 底下、`clasp` 認得的檔案類型
   （`.gs`/`.json`/`.html`），不會動到 Google Sheets 本身的資料。

## 日常部署流程

改完 `apps-script/Code.gs`（或 `appsscript.json`）後：

```bash
cd apps-script
npx @google/clasp push                                   # 同步程式碼到 Apps Script 專案
npx @google/clasp deploy --deploymentId <既有部署 ID>      # 更新既有部署，網址不變
```

- **更新既有部署（網址不變，一般情況都用這個）**：先用
  `npx @google/clasp deployments` 列出現有部署的 ID，再照上面指令帶
  `--deploymentId` 更新；前端 `.env` 的 `VITE_SHEETS_URL` 不需要跟著改。
- **建立全新部署（拿到新網址）**：
  ```bash
  npx @google/clasp deploy --description "說明這次部署的內容"
  ```
  完成後執行 `npx @google/clasp deployments` 找到剛建立的部署，用
  `npx @google/clasp open --webapp` 開啟瀏覽器確認網址，或到 Apps Script
  編輯器「部署」→「管理部署作業」複製新的 `/exec` 網址。拿到新網址後要更新
  `.env`（本機）與正式站環境變數的 `VITE_SHEETS_URL`，並重新建置前端——
  Settings 頁面已經不支援手動覆寫這個網址，變更一律透過環境變數 + 重新部署。
- 第一次執行 `clasp deploy`（尚無任何部署）時，Web App 的執行身分/存取權限沿用
  `appsscript.json` 裡 `webapp` 區塊的設定（目前是「執行身分：我」「任何人皆可
  存取」），不需要再手動於編輯器裡選一次。

  **`access` 欄位務必是 `"ANYONE_ANONYMOUS"`，不是 `"ANYONE"`。** 這兩個值在
  manifest 裡長得很像但行為完全不同：`"ANYONE"` 對應的其實是「任何擁有 Google
  帳號的使用者」，未登入的訪客會被導去 Google 登入頁；只有 `"ANYONE_ANONYMOUS"`
  才是編輯器 UI 顯示的「任何人」（含匿名訪客），也是這個唯讀＋訪客可瀏覽的架構
  真正需要的設定。改完 `appsscript.json` 之後，務必用
  `curl "<你的 /exec 網址>?sheet=USERS"` 確認回應是 JSON（`{"success":true,...}`）
  而不是被導去 `accounts.google.com` 的登入頁，再收工。

## 首次設定（務必在分享網址前執行一次）

`USERS` 分頁完全空白時，才能透過下面的方式建立初始帳號；已有資料時會直接失敗，
不會覆蓋既有帳號，因此可以安全地重複呼叫確認。

用任何方式對 Web App 網址送出一次性的 POST，body 為：

```json
{ "action": "setup" }
```

例如在終端機執行（把 `<你的 Web App 網址>` 換成實際網址）：

```bash
curl -X POST -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"action":"setup"}' \
  "<你的 Web App 網址>"
```

成功會回傳建立了幾個帳號的訊息。初始帳號的臨時密碼一律是 `123456`，且會被標記
「首次登入必須變更密碼」——前端登入成功後會自動彈出修改密碼視窗，不需要手動處理。

**請務必先執行這一步，再把網站網址分享出去。** 若在完成初始化前就有人搶先呼叫
`setup`，對方會知道初始帳號清單與臨時密碼；因為每個帳號都會在首次登入時被強制
要求改密碼，實際影響有限，但仍建議把部署與初始化視為同一個不對外公開的步驟。

## 舊格式 USERS 分頁轉換（僅需執行一次）

如果 `USERS` 分頁是很早期就存在、從沒被這支腳本初始化過，欄名可能還停留在
「帳號 (username)」「暱稱 (nickname)」「完整資料 (JSON)」這種舊式中文欄名，
這會讓 `setup` 因為「分頁已有資料」而拒絕執行，同時所有帳號都會登入失敗、
回報「帳號 ID 不存在」——因為登入比對邏輯是找一欄精確叫 `username` 的欄位，
找不到就視為沒有這個帳號。

**執行前建議先備份**：在 Google Sheets 裡右鍵 `USERS` 分頁 →「複製」，留一份
原始資料。

用同樣的方式對 Web App 網址送出一次性的 POST：

```json
{ "action": "migrate_users_legacy_headers" }
```

```bash
curl -X POST -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"action":"migrate_users_legacy_headers"}' \
  "<你的 Web App 網址>"
```

這會把每一列的「完整資料 (JSON)」內容還原出來，重寫成 `handleLogin_` 等函式
預期的英文欄名；已經有密碼雜湊的帳號會保留原密碼，沒有的話會沿用臨時密碼
`123456` 並標記「首次登入必須變更密碼」。`USERS` 分頁如果已經是新版欄位格式，
呼叫這個動作會直接失敗、不會重複執行或覆蓋資料。

**如果 `USERS` 分頁已經被清空或改壞**（例如手動編輯表頭時不小心刪掉資料），
但還留著一份備份分頁（例如用「複製」留下的「USERS 的副本」），可以在 body
多帶一個 `sourceSheet` 指定要從哪個分頁讀取舊資料，轉換結果一律會寫回
`USERS` 這個分頁本身，來源分頁不會被更動：

```json
{ "action": "migrate_users_legacy_headers", "sourceSheet": "USERS 的副本" }
```

## 內容分頁（UI_RESEARCH…）與 NOTIFICATIONS 的欄位轉換（僅需執行一次）

跟 `USERS` 一樣，這些分頁如果從沒被這支腳本轉換過，欄名也還停留在
`ID`、「建立時間 (createdAt)」這種舊式中文欄名，會跟目前 `handleWrite_`
實際在用的英文欄名（`id`、`createdAt`…）對不起來——新增或編輯項目時會
因為找不到對應欄位，在旁邊長出一堆重複欄位，而不是正確更新原本那一列。

用同樣的方式對 Web App 網址送出一次性的 POST：

```json
{ "action": "migrate_content_legacy_headers" }
```

```bash
curl -X POST -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"action":"migrate_content_legacy_headers"}' \
  "<你的 Web App 網址>"
```

預設會轉換所有內容分頁＋`NOTIFICATIONS`；也可以用 `sheets` 只指定幾個：

```json
{ "action": "migrate_content_legacy_headers", "sheets": ["UI_RESEARCH", "COMPETITORS"] }
```

這個轉換只是把欄位「改名」（例如 `ID` → `id`），不會重組或搬動任何一格
資料，「完整資料 (JSON)」欄位維持原欄名、內容完全不動（前端讀取內容時
仍然靠它），所以風險很低。`createdAt` / `updatedAt` 這兩欄會順便轉成
真正的日期型別，並統一顯示成 `yyyy/m/d h:mm:ss`（24 小時制）。已經是
新版欄位格式的分頁會直接略過、不會重複執行。

## 時間欄位的顯示格式

`createdAt` / `updatedAt` 這兩個時間欄位，不論是登入、改密碼、新增/編輯
項目，或是上面兩個一次性轉換動作寫入的，現在一律會被轉成真正的 Date
型別，並統一套用 `yyyy/m/d h:mm:ss`（24 小時制，例如 `2026/7/20 8:00:00`）
的顯示格式——不會再出現 ISO 字串、`Date.toString()` 那種混雜格式。這個
轉換只影響 Google Sheets 儲存格「怎麼顯示」，透過 API 讀出來的仍然是
標準 ISO 字串（JSON 序列化 Date 物件的預設行為），前端不需要做任何改動。

## 這一版做了什麼、為什麼要重新部署

舊版腳本（本次沒有留存原始碼，因此是整份重寫，不是修補）把 `USERS` 分頁當成單純
的資料庫代理：前端直接讀出整份成員清單（含明文密碼欄位），登入時用瀏覽器端的
JavaScript 自己比對密碼是否相符。這代表：

- 任何人打開瀏覽器開發者工具，都能在網路請求或 `localStorage` 快取裡直接看到
  所有人的密碼明文。
- 「登入」本質上只是把使用者名稱寫進 `localStorage`；不需要密碼正確，只要把
  `design_lab_username` 設成 `@quni_jhuang` 就能讓前端把自己當成最高管理員。

新版腳本把這兩個問題都移到伺服器端解決：

- 密碼一律以加鹽迭代雜湊（SHA-256 × 2000 次）方式儲存，`USERS` 分頁的公開讀取
  一律不回傳密碼欄位；就算密碼欄位還留著舊版明文，第一次成功登入時會自動就地
  升級為雜湊並清空明文欄位。
- 登入才會核發 Session Token（存在 Apps Script 的 `CacheService`，6 小時過期，
  每次使用會自動延長），寫入、刪除、成員管理一律要求附上這個 Token，並在伺服器
  端依 `USERS` 分頁實際記錄的角色重新授權——前端宣稱自己是誰、是什麼角色，伺服器
  完全不採信。
- 移除了「帳號字串等於 `@quni_jhuang` 就自動視為最高管理員」的後門，角色一律以
  試算表實際資料為準。

讀取（`doGet`）維持完全公開、不需登入，符合「訪客可以瀏覽，寫入才需要登入」的
既有需求。

## 已知取捨（沒有真正後端時的限制）

- Apps Script 沒有原生的 bcrypt / Argon2，這裡用「每人一組隨機鹽 + SHA-256 迭代
  雜湊」作為折衷，強度不如專用的密碼雜湊演算法，但已經遠優於明文儲存與前端比對。
- 連續登入失敗 5 次會鎖定該帳號 5 分鐘，降低密碼猜測攻擊的效率，但無法完全阻絕。
- Session Token 存在 `CacheService`，理論上有極小機率被 Google 提前回收（記憶體
  壓力），使用者只需要重新登入，不影響資料安全性。
- 這支腳本的 Web App 網址本身仍是公開資訊（讀取本來就要公開）。請勿把 Apps
  Script 專案的原始碼編輯權限分享給不需要的人——雖然前端看不到密碼，但能編輯這
  支腳本的人等於擁有伺服器權限。
