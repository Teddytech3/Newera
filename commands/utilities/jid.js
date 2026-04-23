import { replyText } from '../../utils/reply.js';

export default {
  name: 'jid',
  alias: ['id'],
  desc: 'Get chat/user JID',
  run: async (sock, m) => {
    const quoted = m.message?.extendedTextMessage?.contextInfo?.participant;
    const user = quoted || m.key.participant || m.key.remoteJid;

    const info = `*🆔 JID Info*\n\n*Chat JID:* ${m.key.remoteJid}\n*User JID:* ${user}\n*Type:* ${m.key.remoteJid.endsWith('@g.us')? 'Group' : 'Private'}`;

    await replyText(sock, m, info);
  }
};