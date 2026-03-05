# Gemini-to-IM 🤖💬

[English](README.md) | 繁體中文

這是一個輕量級、獨立運作的橋接專案，專門將 Google 的 Gemini API 連接到即時通訊平台（如 Telegram）。它支援「打字機串流生成（Real-time Streaming）」與「互動式工具授權（Interactive Tool Approvals）」。

受到 [Claude-to-IM](https://github.com/op7418/Claude-to-IM) 專案的啟發，此專案將強大的 CLI / 終端機 AI 體驗，直接帶到了您的手機上。

---

## 🆚 官方 Gemini App 與 Gemini-to-IM：有什麼不同？

您可以將手機上的官方 Gemini App 想像成一台**隨叫隨到的高級計程車** — 它功能強大、方便快捷，但能做的事情受限於駕駛（Google）。而您的 **`gemini-to-im`** 則像是一台停在您家車庫、**可以無限改裝的私家車**。

| 特性           | 📱 官方 Gemini App                      | 💻 您的 `gemini-to-im`                   |
| :------------- | :-------------------------------------- | :--------------------------------------- |
| **核心 AI**    | 運行於 Google 的雲端伺服器上。         | **運行於您自己的電腦上**，再連接 Google 雲端 AI。 |
| **特殊能力**   | 整合 Google 服務（Gmail, Docs 等）。    | **可以控制您的電腦！** 它可以：<br>• **找停車位** (執行您電腦中的 Python 腳本)<br>• **查詢浪況** (執行您電腦中的 Python 腳本)<br>• **執行您系統中任何程式** (需您明確授權)。 |
| **隱私與資料** | 您的對話紀錄儲存在 **Google 的雲端伺服器**。 | 您的對話紀錄儲存在**您自己的電腦上** (`sessions.json` 檔案中)。 |
| **自訂程度**   | 僅限應用程式設定。                      | **無限自訂**。您（或 Gemini 本身！）可以新增工具、修改其行為、完全符合您的需求。 |
| **存取方式**   | 手機有網路即可使用。                    | 只要**您的主機電腦持續運行並連上網路**，即可透過 Telegram 存取。 |
| **理想對象**   | 一般大眾，尋求快速 AI 資訊服務。        | **AI 愛好者與開發者**，希望擁有一個可以與本地系統互動並自動化的個人化 AI 助理。 |

---

## ✨ 核心功能

- **打字機效果（串流）**：透過不斷編輯 IM 上的訊息，即時顯示 Gemini 的回覆，提供原生的「打字機」體驗。
- **互動式工具授權**：當 Gemini 決定呼叫已註冊的「危險」工具（例如：執行本地終端機指令）時，程式會暫停執行，並在您的聊天視窗中彈出帶有 `[✅ 允許]` 和 `[❌ 拒絕]` 的內聯按鈕（Inline Keyboard）。
- **獨立且輕量化**：不需要安裝龐大的 Agent 框架。純粹使用 Node.js、官方的 `@google/generative-ai` SDK 與 Telegram Bot API 寫成。
- **持久化對話記憶**：自動將對話紀錄寫入 `sessions.json`。即使程式重新啟動，Gemini 依然能記住您的歷史對話與上下文。
- **安全白名單機制**：透過 `ALLOWED_USER_IDS` 限制特定使用者，保護您的 API 額度與系統安全。
- **長訊息自動切分與容錯**：自動將超過 4000 字的長回覆切分成多則訊息，並在 Markdown 解析失敗時自動降級為純文字，確保訊息不漏接。
- **內建在地化工具**：程式已預先整合強大的 Python 腳本（目前支援台灣，透過 `.env` 設定 `LOCALIZATION=TW` 啟用）：
  - 🅿️ **即時停車查詢**：傳送定位點或 Google Maps 網址，立即找出附近空車位與導航連結。
  - 🏄 **衝浪浪況與天氣**：查詢台灣各大浪點的即時潮汐、風況與颱風動態。
- **速率限制處理**：內建的節流函式（Throttle/Debounce）可防止在快速串流文字時，觸發 Telegram 嚴格的 API 速率限制（Rate Limits）。
- **模組化轉接器架構**：核心的 Gemini 邏輯與通訊平台是解耦的。開發者可以非常輕易地抽換或擴充 **Discord**、**LINE** 或 **Slack** 的轉接器（Adapter）。

---

## 💡 為什麼選擇此專案？

現有的機器人通常過於臃腫且設定複雜，**Gemini-to-IM** 專注於極致的簡約：
- **完全獨立運作**：不需資料庫、不需複雜框架。只有一個 `index.js`，讓您在幾分鐘內完成部署。
- **針對 Gemini 深度優化**：專為 Google 的 Generative AI SDK 調校，確保在 Telegram 上能流暢顯示串流文字並穩定調用工具。
- **開發者友善**：這是一個絕佳的範本，適合想要學習如何透過通訊軟體遠端調用 LLM 工具的開發者。

## 🖥️ 運行環境要求

此橋接器設計極為輕量，幾乎可以在任何現代化系統上運行：

- **作業系統**: Linux (Ubuntu, Debian 等), macOS, 或 Windows (推薦透過 WSL2 執行)。
- **軟體環境**: 
  - **Node.js**: v18.0.0 或更高版本。
  - **Python**: v3.9 或更高版本（若要使用內建的停車/衝浪工具才需要）。
- **硬體需求**: 資源消耗極低，可運行於 **Raspberry Pi (樹莓派)**、家用小型伺服器，或任何雲端平台的免費版 VPS (如 Oracle Cloud, AWS 等)。

## 🔑 帳號與金鑰需求

要啟動此橋接器，您需要申請以下帳號與 API 金鑰：

### 必要項目 (核心 AI 功能)
1. **Google AI Studio**: 取得 [Gemini API Key](https://aistudio.google.com/app/apikey)（有免費額度可使用）。
2. **Telegram**: 向 [@BotFather](https://t.me/botfather) 申請建立新機器人，並取得 **Telegram Bot Token**。

### 選用項目 (台灣在地化工具)
- **交通部 TDX 平台**: 在 [tdx.transportdata.tw](https://tdx.transportdata.tw/) 註冊，以取得用於**停車場查詢**的 `Client ID` 與 `Secret`。
- **氣象署開放資料平台**: 在 [opendata.cwa.gov.tw](https://opendata.cwa.gov.tw/) 註冊，以取得用於**衝浪浪況**的 `API Key`。

## 🚀 新手友善啟動指南 (一步步教學)

如果您從未寫過程式或使用過終端機，請按照以下步驟操作：

### 第一步：準備環境
- **安裝 Node.js**：前往 [nodejs.org](https://nodejs.org/) 下載並安裝「LTS 穩定版」。
- **安裝 Python**：前往 [python.org](https://www.python.org/) 下載並安裝（如果您要使用找車位或衝浪功能才需要）。

### 第二步：取得免費金鑰
1. **Gemini 金鑰**：登入 [Google AI Studio](https://aistudio.google.com/app/apikey) 點擊 "Create API key"。
2. **Telegram 機器人**：在 Telegram 搜尋 `@BotFather`，輸入 `/newbot` 照著指示設定，最後會拿到一串 **HTTP API Token**。
3. **您的使用者 ID**：在 Telegram 搜尋 `@userinfobot` 並傳訊息給它，它會回傳您的 **ID** (一串數字)，這就是白名單要用的。

### 第三步：設定與執行
1. 下載本專案的 ZIP 檔並解壓縮（或使用 `git clone`）。
2. 開啟您的終端機 (Windows 搜尋 `cmd`，Mac 搜尋 `終端機`)。
3. 輸入 `cd `（後面有一個空格），然後將您解壓縮後的資料夾**直接拖進**終端機視窗，按下 Enter。
4. 輸入指令 `npm install` 並按下 Enter。
5. 在資料夾中建立一個名為 `.env` 的檔案（可以複製 `.env.example` 來改），把您的金鑰貼進去。
6. 最後輸入 `node index.js` 即可啟動！

---

## 🚀 進階安裝指南 (開發者適用)

### 1. 複製專案
```bash
git clone https://github.com/您的帳號/gemini-to-im.git
cd gemini-to-im
```

### 2. 安裝依賴套件
```bash
npm install
```

### 3. 設定環境變數
複製環境變數範本檔：
```bash
cp .env.example .env
```

編輯 `.env` 並填入您的 API 金鑰：
```ini
TELEGRAM_BOT_TOKEN=您的_Telegram_Bot_Token
GEMINI_API_KEY=您的_Google_Gemini_API_Key

# 啟用在地化工具 (目前支援：TW)
LOCALIZATION=TW
```

### 4. 啟動橋接器
手動啟動以進行測試：
```bash
node index.js
```

或使用 PM2 在背景常駐運行：
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
```

## 🎮 使用方式

程式啟動後，只要打開您的 Telegram Bot 即可開始對話。

若要測試 **互動式授權 (Interactive Approvals)** 功能，請告訴 Gemini：
> 「請幫我執行一個測試指令，例如 ls -la。」

Gemini 會嘗試呼叫 `run_shell_command` 工具，這會觸發 Bot 發送一個帶有按鈕的授權請求給您。當您點擊「允許」後，程式會將模擬的執行結果傳回給 Gemini，讓它繼續與您的對話。

## 🏗️ 如何加入真實的系統指令執行
基於安全考量，目前 `index.js` 中的 `run_shell_command` 工具只會回傳「模擬（Mocked）」的輸出結果。如果您希望真的執行系統指令，可以在 `callback_query` 處理器中整合 Node.js 的 `child_process.exec`。**請注意：執行此操作需自負風險，並確保您的 Bot 嚴格限制為私人使用！**

## 🔌 開發自訂轉接器 (Discord / LINE / Slack)

本系統的設計具備模組化思維。核心邏輯負責處理 Gemini 的串流、對話記憶與工具調用，而「轉接器（Adapter）」則負責處理各個通訊平台的收發訊息。

如果您想支援 **LINE** 或是 **Discord**，您完全不需要重寫 AI 的部分。您只需要：
1. 參考目前的 Telegram 實作（`index.js` 或未來 `src/adapters/` 內的程式碼）。
2. 將 `node-telegram-bot-api` 替換成 `discord.js` 或是 `@line/bot-sdk`。
3. 將該平台「收到訊息」的事件對接到 Gemini 的 Session 處理常式。
4. （以 LINE 為例）因為 LINE 不支援即時編輯訊息（沒有打字機效果），您可以將串流文字收集起來，等串流結束後，再一次性使用 `replyMessage` 送出。

## 🤝 貢獻指南
非常歡迎發起 Pull Requests！如果您有興趣，歡迎協助新增 Discord、Slack 或 Line 的轉接器（Adapters）。

## 📜 授權條款
MIT
