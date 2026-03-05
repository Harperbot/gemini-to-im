/**
 * 這是 LINE 轉接器 (Line Adapter) 的開發範本
 * 由於 LINE 不支援即時編輯訊息（沒有打字機效果），
 * 所以需要將 Gemini 的串流文字收集起來，最後一次性發送。
 */

const line = require('@line/bot-sdk');

class LineAdapter {
  constructor(geminiCore) {
    this.geminiCore = geminiCore;
    this.client = new line.Client({
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
    });
  }

  // 處理收到的 LINE Webhook 事件
  async handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
      return Promise.resolve(null);
    }

    const userId = event.source.userId;
    const userText = event.message.text;

    try {
      // 1. 初始化或獲取該 User 的 Gemini Session
      const session = this.geminiCore.getOrCreateSession(userId);

      // 2. 由於 LINE 沒有打字機效果，我們先回覆一個「思考中」的訊息
      // 注意：LINE Reply Token 只能使用一次，所以這裡可能要用 Push Message 或先扣著
      
      // 3. 獲取 Gemini 串流結果
      const result = await session.chat.sendMessageStream(userText);
      let fullResponse = "";

      for await (const chunk of result.stream) {
        if (chunk.text) {
          fullResponse += chunk.text();
        }
        
        // 如果有 Tool Call (如需要授權的指令)，
        // 在這裡可以呼叫 LINE 的 Flex Message 傳送按鈕
        if (chunk.functionCalls && chunk.functionCalls.length > 0) {
          // 處理工具呼叫的邏輯
          // ...
          return;
        }
      }

      // 4. 串流結束，一次性將完整回覆送給 LINE 使用者
      return this.client.replyMessage(event.replyToken, {
        type: 'text',
        text: fullResponse
      });

    } catch (error) {
      console.error(error);
      return this.client.replyMessage(event.replyToken, {
        type: 'text',
        text: '處理時發生錯誤。'
      });
    }
  }
}

module.exports = LineAdapter;
