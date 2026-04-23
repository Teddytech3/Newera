import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'savestatus',
  alias: ['ss', 'statusdl'],
  desc: 'Download status and send to you',
  run: async (sock, m) => {
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted || m.key.remoteJid!== 'status@broadcast') {
      return replyText(sock, m, '❌ *Reply to a status*\n\nUsage:.savestatus (reply to status)');
    }

    try {
      const type = Object.keys(quoted)[0];
      const media = await downloadMediaMessage({ message: quoted }, 'buffer', {});
      const sender = m.key.participant;

      if (type === 'imageMessage') {
        await sock.sendMessage(sender, { image: media, caption: '*📥 Status Saved*' });
      } else if (type === 'videoMessage') {
        await sock.sendMessage(sender, { video: media, caption: '*📥 Status Saved*' });
      } else {
        return replyText(sock, m, '❌ *Only image/video status supported*');
      }

      await replyText(sock, m, '✅ *Status sent to your DM*');
    } catch (e) {
      await replyText(sock, m, '❌ *Failed to download status*');
    }
  }
};