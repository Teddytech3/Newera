import { replyText } from '../../utils/reply.js';

export default {
  name: 'link',
  alias: ['gclink', 'invitelink'],
  desc: 'Get group invite link',
  run: async (sock, m) => {
    if (!m.key.remoteJid.endsWith('@g.us')) return replyText(sock, m, '❌ *Group command only*');

    try {
      const code = await sock.groupInviteCode(m.key.remoteJid);
      await replyText(sock, m, `*🔗 Group Invite Link*\n\nhttps://chat.whatsapp.com/${code}`);
    } catch (e) {
      await replyText(sock, m, '❌ *Bot must be admin to get link*');
    }
  }
};