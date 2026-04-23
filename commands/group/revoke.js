import { replyText } from '../../utils/reply.js';

export default {
  name: 'revoke',
  alias: ['resetlink'],
  desc: 'Reset group invite link',
  run: async (sock, m) => {
    if (!m.key.remoteJid.endsWith('@g.us')) return replyText(sock, m, '❌ *Group command only*');

    try {
      await sock.groupRevokeInvite(m.key.remoteJid);
      const code = await sock.groupInviteCode(m.key.remoteJid);
      await replyText(sock, m, `✅ *Link reset*\n\n*New link:*\nhttps://chat.whatsapp.com/${code}`);
    } catch (e) {
      await replyText(sock, m, '❌ *Bot must be admin*');
    }
  }
};