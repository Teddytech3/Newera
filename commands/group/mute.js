import { replyText } from '../../utils/reply.js';

export default {
  name: 'mute',
  alias: ['close'],
  desc: 'Mute group - only admins can send',
  run: async (sock, m) => {
    if (!m.key.remoteJid.endsWith('@g.us')) return replyText(sock, m, '❌ *Group command only*');

    try {
      await sock.groupSettingUpdate(m.key.remoteJid, 'announcement');
      await replyText(sock, m, '🔇 *Group muted*\n\nOnly admins can send messages');
    } catch (e) {
      await replyText(sock, m, '❌ *Bot must be admin*');
    }
  }
};