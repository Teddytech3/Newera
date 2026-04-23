import { User } from '../../database/models.js';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'ban',
  desc: 'Ban user from using bot',
  ownerOnly: true,
  run: async (sock, m, args) => {
    const user = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                 m.message.extendedTextMessage?.contextInfo?.participant;

    if (!user) return replyText(sock, m, '❌ *Tag user to ban*\n\nUsage:.ban @user');

    await User.updateOne({ jid: user }, { banned: true }, { upsert: true });
    await replyText(sock, m, `✅ *User Banned*\n\n@${user.split('@')[0]} can no longer use bot`, { mentions: [user] });
  }
};