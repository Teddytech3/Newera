import axios from 'axios';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'yt',
  alias: ['yts', 'youtube'],
  desc: 'Search YouTube videos',
  run: async (sock, m, args) => {
    const query = args.join(' ');
    if (!query) return replyText(sock, m, '❌ *Usage:*.yt <search query>');

    await sock.sendMessage(m.key.remoteJid, { text: `🔍 *Searching YouTube:* ${query}` }, { quoted: m });

    try {
      const res = await axios.get(`https://api.dreaded.site/api/youtube/search?query=${encodeURIComponent(query)}`);

      if (!res.data.success) throw new Error('Search failed');

      const results = res.data.data.slice(0, 5);
      let text = `*🔍 YouTube Search: ${query}*\n\n`;

      results.forEach((v, i) => {
        text += `*${i + 1}. ${v.title}*\n`;
        text += `⏱️ ${v.duration} | 👁️ ${v.views}\n`;
        text += `🔗 ${v.url}\n\n`;
      });

      text += `*Download:*.video <url> or.mp3 <url>`;
      await replyText(sock, m, text);

    } catch (e) {
      await replyText(sock, m, '❌ *Search failed*\n\nTry again later');
    }
  }
};