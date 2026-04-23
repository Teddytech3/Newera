import { replyText } from '../../utils/reply.js';

export default {
  name: 'whois',
  alias: ['userinfo'],
  desc: 'Get user information',
  run: async (sock, m) => {
    const user = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                 m.message.extendedTextMessage?.contextInfo?.participant ||
                 m.key.participant ||
                 m.key.remoteJid;

    try {
      const pp = await sock.profilePictureUrl(user, 'image').catch(() => null);
      const status = await sock.fetchStatus(user).catch(() => null);
      const name = m.message.extendedTextMessage?.contextInfo?.pushName || 'Unknown';

      const info = `*👤 User Info*\n\n*Name:* ${name}\n*Number:* +${user.split('@')[0]}\n*JID:* ${user}\n*Bio:* ${status?.status || 'Not set'}\n*Updated:* ${status? new Date(status.setAt).toLocaleDateString() : 'N/A'}`;

      if (pp) {
        await sock.sendMessage(m.key.remoteJid, { image: { url: pp }, caption: info }, { quoted: m });
      } else {
        await replyText(sock, m, info);
      }
    } catch (e) {
      await replyText(sock, m, '❌ *Failed to fetch user info*');
    }
  }
};