import { Bot } from '../../database/models.js';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'listbots',
  alias: ['bots'],
  desc: 'List all connected bots',
  ownerOnly: true,
  run: async (sock, m) => {
    const bots = await Bot.find().sort({ addedAt: -1 });
    if (!bots.length) return replyText(sock, m, '❌ *No bots connected*\n\nUse.addbot <session> to add');

    let text = `*🤖 CONNECTED BOTS (${bots.length}/10)*\n\n`;
    bots.forEach((bot, i) => {
      const status = bot.active? '🟢 Online' : '🔴 Offline';
      const date = new Date(bot.addedAt).toLocaleDateString();
      text += `*${i + 1}.* +${bot.phone}\n ${status} | Added: ${date}\n\n`;
    });

    text += `*Remove:*.removebot <phone>\n*Add:*.addbot <session>`;
    await replyText(sock, m, text);
  }
};