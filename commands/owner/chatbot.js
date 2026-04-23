import { Config } from '../../database/models.js';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'chatbot',
  desc: 'AI chatbot for DMs',
  ownerOnly: true,
  run: async (sock, m, args) => {
    const action = args[0];
    if (!action) {
      const status = (await Config.findOne({ key: 'CHATBOT' }))?.value;
      return replyText(sock, m, `*Chatbot DM:* ${status? '🟢 ON' : '🔴 OFF'}\n\n.chatbot on/off\n\nAI replies to all DM messages`);
    }

    await Config.updateOne({ key: 'CHATBOT' }, { value: action === 'on' }, { upsert: true });
    await replyText(sock, m, `${action === 'on'? '✅' : '❌'} *Chatbot ${action.toUpperCase()}*\n\n${action === 'on'? 'AI will reply to DMs' : 'Chatbot disabled'}`);
  }
};