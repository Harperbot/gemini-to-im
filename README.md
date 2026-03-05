# Gemini-to-IM 🤖💬

English | [繁體中文](README.zh-TW.md)

A lightweight, standalone bridge connecting the Google Gemini API to Instant Messaging platforms (like Telegram) with real-time streaming and interactive tool-use approvals.

Inspired by [Claude-to-IM](https://github.com/op7418/Claude-to-IM), this project brings the robust CLI/terminal AI experience directly to your mobile phone.

---

## 🆚 Gemini App vs. Gemini-to-IM: What's the Difference?

Think of the official Gemini App on your phone as a **premium taxi service** — powerful, convenient, but limited to what the driver (Google) can do. Your **`gemini-to-im`** is like **your personal, customizable car** parked in your garage.

| Feature          | 📱 Official Gemini App                      | 💻 Your `gemini-to-im`                       |
| :--------------- | :---------------------------------------- | :------------------------------------------- |
| **Core AI**      | Runs on Google's cloud servers.           | **Runs on your computer**, connects to Google's cloud AI. |
| **Superpowers**  | Integrates with Google services (Gmail, Docs). | **Controls your computer!** Can:<br>• **Find parking** (runs Python scripts on your machine)<br>• **Check surf forecasts** (runs Python scripts on your machine)<br>• **Execute any program** on your system (with your explicit approval). |
| **Privacy & Data** | Your conversations are stored on **Google's cloud servers**. | Your conversations are stored **locally on your computer** (`sessions.json`). |
| **Customization**| Limited to app settings.                  | **Infinitely customizable**. You (or Gemini itself!) can add new tools, modify its behavior, and tailor it to your exact needs. |
| **Access**       | Available anywhere your phone has internet. | Accessible via Telegram wherever your **host computer is running and connected to the internet**. |
| **Ideal for**    | General users seeking quick AI info.      | **AI enthusiasts & developers** who want a personalized AI assistant that can interact with and automate their local system. |

---

## ✨ Features

- **Typing Effect (Streaming)**: Streams Gemini's responses in real-time by continuously editing the IM message, providing a native "typewriter" experience without hitting API limits.
- **Interactive Tool Approvals**: When Gemini decides to use a registered "dangerous" tool (e.g., executing a local shell command), it pauses execution and sends an inline keyboard with `[✅ Allow]` and `[❌ Reject]` buttons to your chat.
- **Standalone & Lightweight**: No bulky agent frameworks required. It relies purely on Node.js, the official `@google/generative-ai` SDK, and the Telegram Bot API.
- **Persistent Memory**: Automatically saves your conversation history to `sessions.json`. Even if the server restarts, Gemini remembers who you are and what you talked about.
- **Security Whitelisting**: Restrict access to specific users via `ALLOWED_USER_IDS` to protect your API quota and system.
- **Auto-Chunking & Fallback**: Automatically splits long responses (>4000 chars) into multiple messages and falls back to plain text if Markdown parsing fails, ensuring reliable delivery.
- **Built-in Localized Tools**: Comes pre-packaged with powerful tools (currently tailored for Taiwan, set via `LOCALIZATION=TW` in `.env`):
  - 🅿️ **Real-time Parking Query**: Instantly finds available parking spots near a location or Google Maps link.
  - 🏄 **Surf Spot Weather**: Gets real-time tides, wind conditions, and typhoon updates for Taiwan surf spots.
- **Rate Limit Handling**: Built-in throttler (debounce/throttle) prevents hitting Telegram's strict message editing rate limits during fast streaming.
- **Modular Adapter Architecture**: The core Gemini logic is decoupled from the IM platform. You can easily plug in your own adapters for **Discord**, **LINE**, or **Slack**.

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

## 🚀 Getting Started (Step-by-Step for Beginners)

If you have never used a CLI or programmed before, follow these steps:

### 1. Prepare your environment
- **Install Node.js**: Download and install the "LTS" version from [nodejs.org](https://nodejs.org/).
- **Install Python**: Download and install from [python.org](https://www.python.org/). (Required only if you use Taiwan tools).

### 2. Get your Keys (It's Free!)
- **Gemini Key**: Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and click "Create API key".
- **Telegram Token**: Search for `@BotFather` in Telegram, send `/newbot`, and follow instructions to get your **HTTP API Token**.
- **Your Chat ID**: Search for `@userinfobot` in Telegram and send it a message to get your personal **ID** (a numbers string).

### 3. Setup the Project
1. Download this project as a ZIP and unzip it (or use `git clone`).
2. Open your terminal (Command Prompt on Windows, Terminal on Mac).
3. Type `cd ` (with a space) and drag your project folder into the terminal window, then hit Enter.
4. Run: `npm install`
5. Create a file named `.env` in the folder (see `.env.example` for format) and paste your keys.

---

## 🚀 Installation (Advanced Users)

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

# Enable localized tools (Currently supports: TW)
LOCALIZATION=TW
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

## 🔌 Building Your Own Adapter (Discord / LINE / Slack)

The system is designed with a modular mindset. The core logic handles Gemini streaming, memory, and tools, while the "Adapter" handles receiving and sending messages.

To support **LINE** or **Discord**, you don't need to rewrite the AI logic. Simply:
1. Look at the Telegram implementation (`index.js`).
2. Swap out `node-telegram-bot-api` for `discord.js` or `@line/bot-sdk`.
3. Map your platform's incoming message event to the Gemini session handler.
4. (For LINE) Since LINE does not support real-time message editing (streaming), you can accumulate the chunks and send them as a single `replyMessage` once the stream ends.

## 🤝 Contributing
Pull requests are welcome! Feel free to add adapters for Discord, Slack, or Line.

## 📜 License
MIT
