import { replyText } from '../../utils/reply.js';

export default {
  name: 'groupinfo',
  alias: ['gcinfo', 'info'],
  desc: 'Get group information',
  run: async (sock, m) => {
    if (!m.key.remoteJid.endsWith('@g.us')) return replyText(sock, m, '❌ *Group command only*');

    const group = await sock.groupMetadata(m.key.remoteJid);
    const admins = group.participants.filter(p => p.admin).map(p => '@' + p.id.split('@')[0]);
    const pp = await sock.profilePictureUrl(m.key.remoteJid, 'image').catch(() => null);

    const info = `*📊 GROUP INFO*\n\n*Name:* ${group.subject}\n*ID:* ${group.id}\n*Members:* ${group.participants.length}\n*Admins:* ${admins.length}\n*Created:* ${new Date(group.creation * 1000).toLocaleDateString()}\n*Description:*\n${group.desc || 'No description'}\n\n*👑 Admins:*\n${admins.join(', ')}`;

    if (pp) {
      await sock.sendMessage(m.key.remoteJid, { image: { url: pp }, caption: info, mentions: group.participants.map(p => p.id) }, { quoted: m });
    } else {
      await replyText(sock, m, info);
    }
  }
};