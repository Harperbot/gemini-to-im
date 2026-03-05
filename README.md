# Gemini-to-IM 🤖💬

English | [繁體中文](README.zh-TW.md)

A lightweight, standalone bridge connecting the Google Gemini API to Instant Messaging platforms (like Telegram) with real-time streaming and interactive tool-use approvals.

Inspired by [Claude-to-IM](https://github.com/op7418/Claude-to-IM), this project brings the robust CLI/terminal AI experience directly to your mobile phone.

---

## ✨ Features

- **Typing Effect (Streaming)**: Streams Gemini's responses in real-time by continuously editing the IM message, providing a native "typewriter" experience without hitting API limits.
- **Interactive Tool Approvals**: When Gemini decides to use a registered "dangerous" tool (e.g., executing a local shell command), it pauses execution and sends an inline keyboard with `[✅ Allow]` and `[❌ Reject]` buttons to your chat.
- **Standalone & Lightweight**: No bulky agent frameworks required. It relies purely on Node.js, the official `@google/generative-ai` SDK, and the Telegram Bot API.
- **Rate Limit Handling**: Built-in throttler (debounce/throttle) prevents hitting Telegram's strict message editing rate limits during fast streaming.

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/gemini-to-im.git
cd gemini-to-im
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configuration
Copy the environment template:
```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```ini
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 4. Run the Bridge
Run manually for testing:
```bash
node index.js
```

Or run in the background using PM2:
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
```

## 🎮 Usage

Once running, simply open your Telegram Bot and start chatting.

To test the **Interactive Approvals** feature, ask Gemini:
> "Please run a test shell command for me, like ls -la."

Gemini will attempt to call the `run_shell_command` tool, triggering the bot to send you an approval request with inline buttons. Once you click "Allow", the mock result is sent back to Gemini to continue the conversation.

## 🏗️ How to Add Real Commands
Currently, the `run_shell_command` tool in `index.js` returns a *mocked* output for safety. If you wish to execute real system commands, you can integrate Node's `child_process.exec` inside the `callback_query` handler. **Do this at your own risk and ensure your bot is strictly private!**

## 🤝 Contributing
Pull requests are welcome! Feel free to add adapters for Discord, Slack, or Line.

## 📜 License
MIT
