import axios from 'axios';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'ai',
  alias: ['chat', 'ask'],
  desc: 'Chat with AI',
  run: async (sock, m, args) => {
    const prompt = args.join(' ');
    if (!prompt) return replyText(sock, m, '❌ *Usage:*.ai <question>\n\nExample:.ai What is quantum physics?');

    await sock.sendMessage(m.key.remoteJid, { text: '🤖 *Thinking...*' }, { quoted: m });

    try {
      const res = await axios.get(`https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(prompt)}`);

      if (!res.data.success) throw new Error('AI Error');

      await replyText(sock, m, `*🤖 AI Response*\n\n${res.data.result}\n\n_Powered by TEDDY-XMD_`);
    } catch (e) {
      await replyText(sock, m, '❌ *AI failed*\n\nTry again later');
    }
  }
};