require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// 初始化環境變數
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ALLOWED_USER_IDS = process.env.ALLOWED_USER_IDS ? process.env.ALLOWED_USER_IDS.split(',').map(id => id.trim()) : [];

if (!TELEGRAM_BOT_TOKEN || !GEMINI_API_KEY) {
  console.error("請在 .env 中設定 TELEGRAM_BOT_TOKEN 與 GEMINI_API_KEY");
  process.exit(1);
}

// 初始化 Bot 與 Gemini API
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SESSION_FILE = path.join(__dirname, 'sessions.json');

// 儲存每個聊天會話的歷史紀錄與狀態
const sessions = new Map();

// 處理訊息切分、格式降級與發送 (改進點 2 & 4)
async function sendSmartMessage(chatId, text, options = {}) {
  const MAX_LENGTH = 4000;
  
  // 內部發送函式，具備 Markdown 失敗降級邏輯
  const attemptSend = async (content, msgId) => {
    try {
      if (msgId) {
        return await bot.editMessageText(content, { chat_id: chatId, message_id: msgId, parse_mode: 'Markdown', ...options });
      } else {
        return await bot.sendMessage(chatId, content, { parse_mode: 'Markdown', ...options });
      }
    } catch (err) {
      if (err.message.includes('message is not modified')) return;
      // 如果 Markdown 解析失敗，降級為純文字
      if (err.message.includes('can\'t parse entities') || err.message.includes('bad request')) {
        if (msgId) {
          return await bot.editMessageText(content, { chat_id: chatId, message_id: msgId, ...options });
        } else {
          return await bot.sendMessage(chatId, content, options);
        }
      }
      throw err;
    }
  };

  if (text.length <= MAX_LENGTH) {
    return await attemptSend(text, options.message_id);
  }

  // 處理長訊息切分
  const chunks = [];
  for (let i = 0; i < text.length; i += MAX_LENGTH) {
    chunks.push(text.substring(i, i + MAX_LENGTH));
  }

  if (options.message_id) {
    await attemptSend(chunks[0], options.message_id);
    for (let i = 1; i < chunks.length; i++) {
      await attemptSend(chunks[i]);
    }
  } else {
    for (const chunk of chunks) {
      await attemptSend(chunk);
    }
  }
}

// 載入持久化記憶
function loadSessions() {
  if (fs.existsSync(SESSION_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
      for (const [chatId, history] of Object.entries(data)) {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", tools: tools });
        const chat = model.startChat({ history: history });
        sessions.set(Number(chatId), { chat, isProcessing: false });
      }
      console.log(`✅ 已載入 ${Object.keys(data).length} 個對話記憶。`);
    } catch (e) {
      console.error("載入對話記憶失敗:", e);
    }
  }
}

// 儲存持久化記憶
async function saveSessions() {
  const dataToSave = {};
  for (const [chatId, session] of sessions.entries()) {
    try {
      // 獲取歷史紀錄並過濾掉可能導致序列化失敗的屬性
      const history = await session.chat.getHistory();
      dataToSave[chatId] = history.map(msg => ({
        role: msg.role,
        parts: msg.parts
      }));
    } catch (e) {
      console.error(`獲取 ${chatId} 歷史紀錄失敗:`, e);
    }
  }
  fs.writeFileSync(SESSION_FILE, JSON.stringify(dataToSave, null, 2), 'utf8');
}

// 動態載入工具模組
const localization = process.env.LOCALIZATION || 'TW'; // 預設為台灣

const baseTools = [
  {
    name: "run_shell_command",
    description: "在宿主機器上執行 Shell 指令（需要使用者授權）。",
    parameters: {
      type: "OBJECT",
      properties: {
        command: { type: "STRING", description: "要執行的 Bash 指令" },
      },
      required: ["command"],
    },
  }
];

const taiwanTools = [
  {
    name: "find_parking",
    description: "尋找台灣附近有空位的停車場，並提供導航連結。支援給定經緯度或地點名稱。",
    parameters: {
      type: "OBJECT",
      properties: {
        lat: { type: "NUMBER", description: "緯度" },
        lon: { type: "NUMBER", description: "經度" },
        location_name: { type: "STRING", description: "地點名稱，若無經緯度可透過此名稱搜尋" }
      }
    }
  },
  {
    name: "query_surf_spots",
    description: "查詢台灣各地的衝浪浪點資訊。即時顯示潮汐、風況與一鍵導航。",
    parameters: {
      type: "OBJECT",
      properties: {
        query: { type: "STRING", description: "浪點名稱 (如: 東河) 或地區 (如: 宜蘭, east)" }
      }
    }
  }
];

// 根據環境變數決定要載入哪些工具
let activeToolDeclarations = [...baseTools];
if (localization === 'TW') {
  activeToolDeclarations = activeToolDeclarations.concat(taiwanTools);
}

const tools = [
  { functionDeclarations: activeToolDeclarations }
];

// 節流函式：避免更新 Telegram 訊息過快導致 Rate Limit
function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function () {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  }
}

// 處理來自 Telegram 的新訊息
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  if (!text) return;

  // 安全白名單檢查 (改進點 1)
  if (ALLOWED_USER_IDS.length > 0 && !ALLOWED_USER_IDS.includes(chatId.toString())) {
    console.warn(`拒絕未經授權的使用者: ${chatId}`);
    return bot.sendMessage(chatId, "❌ 您未獲授權使用此機器人。");
  }

  if (text === '/start') {
    return bot.sendMessage(chatId, "您好！我是您的獨立版 Gemini，支援持久化記憶、在地化工具與長訊息自動處理。");
  }

  // 初始化或獲取會話
  if (!sessions.has(chatId)) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", tools: tools });
    const chat = model.startChat({ history: [] });
    sessions.set(chatId, { chat, isProcessing: false });
  }

  const session = sessions.get(chatId);
  if (session.isProcessing) {
    return bot.sendMessage(chatId, "⚠️ 正在處理上一個請求，請稍候...");
  }

  session.isProcessing = true;

  try {
    // 傳送一個空的「打字中...」訊息
    let replyMsg = await bot.sendMessage(chatId, "⏳ 思考中...");
    let fullText = "";

    // 呼叫 Gemini 的串流生成
    const result = await session.chat.sendMessageStream(text);

    // 節流更新器
    const updateTelegramMessage = throttle(async (newText) => {
      if (newText.trim() === "") return;
      await sendSmartMessage(chatId, newText, { message_id: replyMsg.message_id });
    }, 1000); 

    // 處理串流結果
    for await (const chunk of result.stream) {
      if (chunk.text) {
        fullText += chunk.text();
        updateTelegramMessage(fullText);
      }
      
      // 處理函數呼叫 (Tool Call)
      if (chunk.functionCalls && chunk.functionCalls.length > 0) {
        const call = chunk.functionCalls[0];
        
        // 1. 需要授權的工具
        if (call.name === "run_shell_command") {
          const commandArgs = call.args.command;
          
          // 在原本的對話串結尾加上提示，並附上【允許 / 拒絕】按鈕
          const promptText = `\n\n⚠️ **安全警告：Gemini 要求執行以下指令**\n\n\`${commandArgs}\`\n\n請問是否允許執行？`;
          await bot.editMessageText(fullText + promptText, { 
            chat_id: chatId, 
            message_id: replyMsg.message_id,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "✅ 允許執行", callback_data: JSON.stringify({ action: "allow", cmd: commandArgs }) },
                  { text: "❌ 拒絕", callback_data: JSON.stringify({ action: "deny" }) }
                ]
              ]
            }
          });
          
          session.pendingFunctionCall = call;
          session.isProcessing = false;
          return; 
        }
        
        // 2. 自動執行的無害工具 (找車位 & 衝浪)
        if (call.name === "find_parking" || call.name === "query_surf_spots") {
          await bot.editMessageText(fullText + `\n\n🔍 *正在查詢資料，請稍候...*`, { chat_id: chatId, message_id: replyMsg.message_id, parse_mode: "Markdown" });
          
          let execCmd = "";
          if (call.name === "find_parking") {
            const lat = call.args.lat;
            const lon = call.args.lon;
            const loc = call.args.location_name;
            if (lat && lon) {
              execCmd = `python3 ./tools/taiwan/parking_query.py --lat ${lat} --lon ${lon}`;
            } else if (loc) {
               execCmd = `python3 ./tools/taiwan/parking_query.py --url "?q=${encodeURIComponent(loc)}"`;
            }
          } else if (call.name === "query_surf_spots") {
            const query = call.args.query || "all";
            execCmd = `python3 ./tools/taiwan/surf_query.py --query "${query}"`;
          }

          // 執行 Python 腳本
          exec(execCmd, async (error, stdout, stderr) => {
            const output = stdout || stderr || error.message;
            try {
              let nextReplyMsg = await bot.sendMessage(chatId, "⏳ 分析查詢結果中...");
              let nextFullText = "";
              
              const result2 = await session.chat.sendMessageStream([{
                functionResponse: {
                  name: call.name,
                  response: { result: output }
                }
              }]);

              const updateMsg = throttle(async (newText) => {
                if (newText.trim() === "") return;
                await sendSmartMessage(chatId, newText, { message_id: nextReplyMsg.message_id });
              }, 1000);

              for await (const chunk2 of result2.stream) {
                if (chunk2.text) {
                  nextFullText += chunk2.text();
                  updateMsg(nextFullText);
                }
              }
              setTimeout(() => updateMsg(nextFullText), 600);
            } catch (e) {
              bot.sendMessage(chatId, "❌ 分析時發生錯誤：" + e.message);
            } finally {
              session.isProcessing = false;
            }
          });
          
          return; // 結束這個處理迴圈，等待 exec 的 callback
        }
      }
    }

    // 最後確保所有文字都更新完成
    updateTelegramMessage(fullText);
    setTimeout(() => updateTelegramMessage(fullText), 600); 

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "❌ 處理時發生錯誤：" + error.message);
  } finally {
    if (session && !session.pendingFunctionCall) {
      session.isProcessing = false;
    }
    // 每次對話結束後儲存記憶
    saveSessions();
  }
});

// 處理按鈕回呼 (Callback Query) - 也就是使用者按下了「允許」或「拒絕」
bot.on('callback_query', async (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const data = JSON.parse(callbackQuery.data);
  const session = sessions.get(chatId);

  if (!session || !session.pendingFunctionCall) {
    return bot.answerCallbackQuery(callbackQuery.id, { text: "此請求已過期或無效。" });
  }

  session.isProcessing = true;
  let toolResponse = {};

  if (data.action === "allow") {
    await bot.answerCallbackQuery(callbackQuery.id, { text: "執行中..." });
    // 這裡我們只是 Mock (模擬) 執行指令的結果，安全起見不真的跑 exec()
    const mockOutput = `[模擬執行結果] \n$ ${data.cmd}\n執行成功！`;
    toolResponse = { result: mockOutput };
    await bot.editMessageText(message.text + "\n\n✔️ **您已允許執行。**", { chat_id: chatId, message_id: message.message_id });
  } else {
    await bot.answerCallbackQuery(callbackQuery.id, { text: "已拒絕。" });
    toolResponse = { error: "使用者拒絕執行該指令。" };
    await bot.editMessageText(message.text + "\n\n❌ **您已拒絕執行。**", { chat_id: chatId, message_id: message.message_id });
  }

  // 將使用者的決定與執行結果回傳給 Gemini，讓它繼續對話
  try {
    let replyMsg = await bot.sendMessage(chatId, "⏳ Gemini 正在分析結果...");
    let fullText = "";
    
    const result = await session.chat.sendMessageStream([{
      functionResponse: {
        name: session.pendingFunctionCall.name,
        response: toolResponse
      }
    }]);

    const updateTelegramMessage = throttle(async (newText) => {
      if (newText.trim() === "") return;
      await sendSmartMessage(chatId, newText, { message_id: replyMsg.message_id });
    }, 1000);

    for await (const chunk of result.stream) {
      if (chunk.text) {
        fullText += chunk.text();
        updateTelegramMessage(fullText);
      }
    }
    setTimeout(() => updateTelegramMessage(fullText), 600);
  } catch (error) {
    bot.sendMessage(chatId, "❌ 分析時發生錯誤：" + error.message);
  } finally {
    session.pendingFunctionCall = null;
    session.isProcessing = false;
    // 每次對話結束後儲存記憶
    saveSessions();
  }
});

// 啟動時載入記憶
loadSessions();

console.log("獨立版 Gemini-to-IM 已啟動！請在 Telegram 中發送訊息給您的機器人。");
