import axios from 'axios';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'meme',
  alias: ['memes'],
  desc: 'Get random meme',
  run: async (sock, m) => {
    await sock.sendMessage(m.key.remoteJid, { text: '🔍 *Fetching meme...*' }, { quoted: m });

    try {
      const res = await axios.get('https://api.dreaded.site/api/meme');

      if (!res.data.success) throw new Error('Failed');

      await sock.sendMessage(m.key.remoteJid, {
        image: { url: res.data.url },
        caption: `*😂 ${res.data.title}*\n\n*👍 ${res.data.ups} | 💬 ${res.data.comments}*\n*📱 r/${res.data.subreddit}*\n\n_Powered by TEDDY-XMD_`
      }, { quoted: m });

    } catch (e) {
      await replyText(sock, m, '❌ *Failed to fetch meme*\n\nTry again later');
    }
  }
};