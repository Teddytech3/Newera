import { replyText } from '../../utils/reply.js';

export default {
  name: 'tagall',
  alias: ['all', 'everyone'],
  desc: 'Tag all group members',
  run: async (sock, m, args) => {
    if (!m.key.remoteJid.endsWith('@g.us')) return replyText(sock, m, '❌ *Group command only*');

    const group = await sock.groupMetadata(m.key.remoteJid);
    const participants = group.participants.map(p => p.id);
    const text = args.join(' ') || '📢 *Attention everyone!*';

    await sock.sendMessage(m.key.remoteJid, {
      text: `${text}\n\n${participants.map(p => '@' + p.split('@')[0]).join(' ')}`,
      mentions: participants
    }, { quoted: m });
  }
};