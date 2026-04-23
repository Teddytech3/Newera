import axios from 'axios';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'gemini',
  alias: ['bard'],
  desc: 'Google Gemini AI',
  run: async (sock, m, args) => {
    const prompt = args.join(' ');
    if (!prompt) return replyText(sock, m, '❌ *Usage:*.gemini <prompt>\n\nExample:.gemini Explain relativity');

    await sock.sendMessage(m.key.remoteJid, { text: '✨ *Gemini thinking...*' }, { quoted: m });

    try {
      const res = await axios.get(`https://api.dreaded.site/api/gemini?text=${encodeURIComponent(prompt)}`);

      if (!res.data.success) throw new Error('Gemini Error');

      await replyText(sock, m, `*✨ Google Gemini*\n\n${res.data.result}\n\n_Powered by TEDDY-XMD_`);
    } catch (e) {
      await replyText(sock, m, '❌ *Gemini failed*\n\nTry again later');
    }
  }
};