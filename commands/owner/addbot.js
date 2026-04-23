import { Bot } from '../../database/models.js';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'addbot',
  desc: 'Connect new bot instance',
  ownerOnly: true,
  run: async (sock, m, args) => {
    const session = args[0];
    if (!session ||!session.startsWith('TEDDY-XMD~')) {
      return replyText(sock, m, '❌ *Invalid Session*\n\nUsage:.addbot TEDDY-XMD~xxx\n\nGet session from panel');
    }

    const count = await Bot.countDocuments();
    if (count >= 10) return replyText(sock, m, '❌ *Max 10 bots reached*\n\nRemove a bot first:.removebot <phone>');

    const phone = session.split('~')[1].split('#')[0];
    const exists = await Bot.findOne({ phone });
    if (exists) return replyText(sock, m, '❌ *Bot already connected*\n\nNumber: ' + phone);

    await Bot.create({ phone, session, active: true, addedAt: new Date() });
    await replyText(sock, m, `✅ *Bot Connected*\n\n*Number:* +${phone}\n*Total Bots:* ${count + 1}/10\n\nBot will connect shortly.`);
  }
};