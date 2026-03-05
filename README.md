# Gemini-to-IM 🤖💬

English | [繁體中文](README.zh-TW.md)

A lightweight, standalone bridge connecting the Google Gemini API to Instant Messaging platforms (like Telegram) with real-time streaming and interactive tool-use approvals.

Inspired by [Claude-to-IM](https://github.com/op7418/Claude-to-IM), this project brings the robust CLI/terminal AI experience directly to your mobile phone.

---

## ✨ Features

- **Typing Effect (Streaming)**: Streams Gemini's responses in real-time by continuously editing the IM message, providing a native "typewriter" experience without hitting API limits.
- **Interactive Tool Approvals**: When Gemini decides to use a registered "dangerous" tool (e.g., executing a local shell command), it pauses execution and sends an inline keyboard with `[✅ Allow]` and `[❌ Reject]` buttons to your chat.
- **Standalone & Lightweight**: No bulky agent frameworks required. It relies purely on Node.js, the official `@google/generative-ai` SDK, and the Telegram Bot API.
- **Persistent Memory**: Automatically saves your conversation history to `sessions.json`. Even if the server restarts, Gemini remembers who you are and what you talked about.
- **Built-in Localized Tools**: Comes pre-packaged with powerful tools for users in Taiwan:
  - 🅿️ **Real-time Parking Query**: Instantly finds available parking spots near a location or Google Maps link.
  - 🏄 **Surf Spot Weather**: Gets real-time tides, wind conditions, and typhoon updates for Taiwan surf spots.
- **Rate Limit Handling**: Built-in throttler (debounce/throttle) prevents hitting Telegram's strict message editing rate limits during fast streaming.

---

## 💡 Why this project?

Existing bots are often bloated with databases and complex setups. **Gemini-to-IM** focuses on simplicity:
- **Purely Standalone**: No databases, no complicated frameworks. Just one `index.js` and you're good to go.
- **Deep Gemini Integration**: Specifically tuned for Google's Generative AI SDK, ensuring smooth streaming and reliable Function Calling.
- **Developer-Friendly**: A perfect boilerplate for developers looking to understand how to bridge LLM tools with mobile apps via Telegram.

## 🖥️ System Requirements

This bridge is designed to be extremely lightweight and can run on almost any modern system:

- **OS**: Linux (Ubuntu, Debian, etc.), macOS, or Windows (via WSL2 recommended).
- **Environment**: 
  - **Node.js**: v18.0.0 or higher.
  - **Python**: v3.9 or higher (required for local tools like parking/surf query).
- **Hardware**: Can run on low-resource devices like a **Raspberry Pi**, a home server, or even a free-tier VPS (Oracle Cloud, AWS, etc.).

## 🔑 Account Requirements

To use this bridge, you will need the following accounts and API keys:

### Mandatory (Core AI Features)
1. **Google AI Studio**: Obtain your [Gemini API Key](https://aistudio.google.com/app/apikey). (Free tier available)
2. **Telegram**: Message [@BotFather](https://t.me/botfather) to create a new bot and get your **Telegram Bot Token**.

### Optional (For Taiwan Localized Tools)
- **TDX (Transport Data eXchange)**: Register at [tdx.transportdata.tw](https://tdx.transportdata.tw/) to get your `Client ID` and `Secret` for **Parking Queries**.
- **CWA Open Data**: Register at [opendata.cwa.gov.tw](https://opendata.cwa.gov.tw/) to get your `API Key` for **Surf Spot Weather**.

---

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
