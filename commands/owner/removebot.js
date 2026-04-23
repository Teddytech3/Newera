import { Bot } from '../../database/models.js';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'removebot',
  desc: 'Remove connected bot',
  ownerOnly: true,
  run: async (sock, m, args) => {
    const phone = args[0]?.replace(/[^0-9]/g, '');
    if (!phone) return replyText(sock, m, '❌ *Usage:*.removebot 254799963583');

    const bot = await Bot.findOneAndDelete({ phone });
    if (!bot) return replyText(sock, m, '❌ *Bot not found*\n\nUse.listbots to see connected bots');

    const count = await Bot.countDocuments();
    await replyText(sock, m, `✅ *Bot Removed*\n\n*Number:* +${phone}\n*Remaining:* ${count}/10`);
  }
};