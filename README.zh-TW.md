# Gemini-to-IM 🤖💬

[English](README.md) | 繁體中文

這是一個輕量級、獨立運作的橋接專案，專門將 Google 的 Gemini API 連接到即時通訊平台（如 Telegram）。它支援「打字機串流生成（Real-time Streaming）」與「互動式工具授權（Interactive Tool Approvals）」。

受到 [Claude-to-IM](https://github.com/op7418/Claude-to-IM) 專案的啟發，此專案將強大的 CLI / 終端機 AI 體驗，直接帶到了您的手機上。

---

## ✨ 核心功能

- **打字機效果（串流）**：透過不斷編輯 IM 上的訊息，即時顯示 Gemini 的回覆，提供原生的「打字機」體驗。
- **互動式工具授權**：當 Gemini 決定呼叫已註冊的「危險」工具（例如：執行本地終端機指令）時，程式會暫停執行，並在您的聊天視窗中彈出帶有 `[✅ 允許]` 和 `[❌ 拒絕]` 的內聯按鈕（Inline Keyboard）。
- **獨立且輕量化**：不需要安裝龐大的 Agent 框架。純粹使用 Node.js、官方的 `@google/generative-ai` SDK 與 Telegram Bot API 寫成。
- **內建台灣在地化工具**：程式已預先整合兩個強大的 Python 腳本（完全不需 OpenClaw）：
  - 🅿️ **即時停車查詢**：傳送定位點或 Google Maps 網址，立即找出附近空車位與導航連結。
  - 🏄 **衝浪浪況與天氣**：查詢台灣各大浪點的即時潮汐、風況與颱風動態。
- **速率限制處理**：內建的節流函式（Throttle/Debounce）可防止在快速串流文字時，觸發 Telegram 嚴格的 API 速率限制（Rate Limits）。

---

## 💡 為什麼選擇此專案？

現有的機器人通常過於臃腫且設定複雜，**Gemini-to-IM** 專注於極致的簡約：
- **完全獨立運作**：不需資料庫、不需複雜框架。只有一個 `index.js`，讓您在幾分鐘內完成部署。
- **針對 Gemini 深度優化**：專為 Google 的 Generative AI SDK 調校，確保在 Telegram 上能流暢顯示串流文字並穩定調用工具。
- **開發者友善**：這是一個絕佳的範本，適合想要學習如何透過通訊軟體遠端調用 LLM 工具的開發者。

---

## 🚀 安裝指南

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

## 🤝 貢獻指南
非常歡迎發起 Pull Requests！如果您有興趣，歡迎協助新增 Discord、Slack 或 Line 的轉接器（Adapters）。

## 📜 授權條款
MIT
