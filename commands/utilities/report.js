import { config } from '../../config.js';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'report',
  alias: ['bug'],
  desc: 'Report bug to owner',
  run: async (sock, m, args) => {
    const issue = args.join(' ');
    if (!issue) return replyText(sock, m, '❌ *Usage:*.report <issue>\n\nExample:.report Video downloader not working');

    const owner = config.OWNER_NUMBER + '@s.whatsapp.net';
    const reporter = m.key.participant || m.key.remoteJid;
    const isGroup = m.key.remoteJid.endsWith('@g.us');
    const chatName = isGroup? (await sock.groupMetadata(m.key.remoteJid)).subject : 'Private Chat';

    const report = `*🐛 BUG REPORT*\n\n*Reporter:* @${reporter.split('@')[0]}\n*Chat:* ${chatName}\n*Time:* ${new Date().toLocaleString()}\n\n*Issue:*\n${issue}`;

    await sock.sendMessage(owner, { text: report, mentions: });
    await replyText(sock, m, `✅ *Report sent to owner*\n\nThank you for helping improve TEDDY-XMD!\n\n_Use.reply <msg> if owner responds_`);
  }
};