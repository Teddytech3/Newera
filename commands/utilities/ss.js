import axios from 'axios';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'ss',
  alias: ['screenshot', 'webss'],
  desc: 'Screenshot website',
  run: async (sock, m, args) => {
    const url = args[0];
    if (!url) return replyText(sock, m, '❌ *Usage:*.ss <url>\n\nExample:.ss https://github.com');

    await sock.sendMessage(m.key.remoteJid, { text: '📸 *Capturing screenshot...*' }, { quoted: m });

    try {
      const res = await axios.get(`https://api.dreaded.site/api/screenshot?url=${encodeURIComponent(url)}`, {
        responseType: 'arraybuffer'
      });

      await sock.sendMessage(m.key.remoteJid, {
        image: Buffer.from(res.data),
        caption: `*📸 Screenshot*\n\n*URL:* ${url}\n\n_Powered by TEDDY-XMD_`
      }, { quoted: m });

    } catch (e) {
      await replyText(sock, m, '❌ *Screenshot failed*\n\nInvalid URL or site blocked');
    }
  }
};