import axios from 'axios';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'gpt',
  alias: ['gpt4', 'chatgpt'],
  desc: 'ChatGPT 4o',
  run: async (sock, m, args) => {
    const prompt = args.join(' ');
    if (!prompt) return replyText(sock, m, '❌ *Usage:*.gpt <prompt>\n\nExample:.gpt Write a poem about Kenya');

    await sock.sendMessage(m.key.remoteJid, { text: '🧠 *GPT-4o thinking...*' }, { quoted: m });

    try {
      const res = await axios.post('https://api.dreaded.site/api/gpt4', {
        prompt: prompt,
        model: 'gpt-4o'
      });

      if (!res.data.success) throw new Error('GPT Error');

      await replyText(sock, m, `*🧠 GPT-4o*\n\n${res.data.response}\n\n_Powered by TEDDY-XMD_`);
    } catch (e) {
      await replyText(sock, m, '❌ *GPT failed*\n\nServer busy, try again');
    }
  }
};