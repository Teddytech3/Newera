import { Group } from '../../database/models.js';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'setemojis',
  desc: 'Set custom emojis for autoreact',
  run: async (sock, m, args) => {
    if (!m.key.remoteJid.endsWith('@g.us')) return replyText(sock, m, '❌ *Group command only*');

    const emojis = args;
    if (!emojis.length) return replyText(sock, m, '❌ *Usage:*.setemojis ❤️ 🔥 😍 💯');

    await Group.updateOne({ jid: m.key.remoteJid }, { reactEmojis: emojis }, { upsert: true });
    await replyText(sock, m, `✅ *Group emojis set*\n\n${emojis.join(' ')}`);
  }
};