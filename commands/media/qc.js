import axios from 'axios';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'qc',
  alias: ['quote'],
  desc: 'Create quote sticker',
  run: async (sock, m, args) => {
    const text = args.join(' ');
    if (!text) return replyText(sock, m, '❌ *Usage:*.qc <text>\n\nExample:.qc Hello World');

    const quoted = m.message?.extendedTextMessage?.contextInfo;
    const name = quoted?.pushName || m.pushName || 'User';
    const pp = await sock.profilePictureUrl(m.key.participant || m.key.remoteJid, 'image').catch(() => 'https://i.imgur.com/3WgPzEM.png');

    try {
      const res = await axios.post('https://api.dreaded.site/api/qc', {
        text,
        name,
        avatar: pp
      }, { responseType: 'arraybuffer' });

      await sock.sendMessage(m.key.remoteJid, { sticker: Buffer.from(res.data) }, { quoted: m });

    } catch (e) {
      await replyText(sock, m, '❌ *Failed to create quote*');
    }
  }
};