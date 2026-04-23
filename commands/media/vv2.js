import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { replyText } from '../../utils/reply.js';
import { config } from '../../config.js';

export default {
  name: 'vv2',
  alias: ['saveviewonce', 'savemedia'],
  desc: 'Save view-once media to owner DM',
  run: async (sock, m) => {
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted?.viewOnceMessageV2) {
      return replyText(sock, m, '❌ *Reply to a view-once message*\n\nUsage:.vv2 (reply to view-once)');
    }

    try {
      const msg = quoted.viewOnceMessageV2.message;
      const type = Object.keys(msg)[0];
      const media = await downloadMediaMessage({ message: msg }, 'buffer', {});
      const owner = config.OWNER_NUMBER + '@s.whatsapp.net';
      const sender = m.key.participant || m.key.remoteJid;

      if (type === 'imageMessage') {
        await sock.sendMessage(owner, {
          image: media,
          caption: `*📥 Saved View-Once*\n\n*From:* @${sender.split('@')[0]}\n*Chat:* ${m.key.remoteJid}`,
          mentions: [sender]
        });
      } else if (type === 'videoMessage') {
        await sock.sendMessage(owner, {
          video: media,
          caption: `*📥 Saved View-Once*\n\n*From:* @${sender.split('@')[0]}\n*Chat:* ${m.key.remoteJid}`,
          mentions: [sender]
        });
      } else if (type === 'audioMessage') {
        await sock.sendMessage(owner, {
          audio: media,
          ptt: msg.audioMessage.ptt,
          contextInfo: { mentionedJid: [sender] }
        });
      }

      await replyText(sock, m, '✅ *Saved to owner DM*');
    } catch (e) {
      await replyText(sock, m, '❌ *Failed to save*\n\nMedia may be expired');
    }
  }
};