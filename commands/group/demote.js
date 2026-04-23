import { replyText } from '../../utils/reply.js';

export default {
  name: 'demote',
  desc: 'Remove admin from user',
  run: async (sock, m) => {
    if (!m.key.remoteJid.endsWith('@g.us')) return replyText(sock, m, '❌ *Group command only*');

    const user = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                 m.message.extendedTextMessage?.contextInfo?.participant;

    if (!user) return replyText(sock, m, '❌ *Tag user to demote*\n\nUsage:.demote @user');

    const group = await sock.groupMetadata(m.key.remoteJid);
    const botAdmin = group.participants.find(p => p.id === sock.user.id)?.admin;
    if (!botAdmin) return replyText(sock, m, '❌ *Bot must be admin*');

    await sock.groupParticipantsUpdate(m.key.remoteJid, [user], 'demote');
    await replyText(sock, m, `✅ *@${user.split('@')[0]} demoted*`, { mentions: [user] });
  }
};