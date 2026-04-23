import { replyText } from '../../utils/reply.js';

export default {
  name: 'unmute',
  alias: ['open'],
  desc: 'Unmute group - all members can send',
  run: async (sock, m) => {
    if (!m.key.remoteJid.endsWith('@g.us')) return replyText(sock, m, '❌ *Group command only*');

    try {
      await sock.groupSettingUpdate(m.key.remoteJid, 'not_announcement');
      await replyText(sock, m, '🔊 *Group unmuted*\n\nAll members can send messages');
    } catch (e) {
      await replyText(sock, m, '❌ *Bot must be admin*');
    }
  }
};