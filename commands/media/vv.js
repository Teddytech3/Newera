import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'vv',
  alias: ['reveal', 'viewonce'],
  desc: 'Reveal view-once media in chat',
  run: async (sock, m) => {
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted?.viewOnceMessageV2) {
      return replyText(sock, m, '❌ *Reply to a view-once message*\n\nUsage:.vv (reply to view-once)');
    }

    try {
      const msg = quoted.viewOnceMessageV2.message;
      const type = Object.keys(msg)[0];
      const media = await downloadMediaMessage({ message: msg }, 'buffer', {});

      if (type === 'imageMessage') {
        await sock.sendMessage(m.key.remoteJid, { image: media, caption: '*🔓 View-Once Revealed*' }, { quoted: m });
      } else if (type === 'videoMessage') {
        await sock.sendMessage(m.key.remoteJid, { video: media, caption: '*🔓 View-Once Revealed*' }, { quoted: m });
      } else if (type === 'audioMessage') {
        await sock.sendMessage(m.key.remoteJid, { audio: media, ptt: msg.audioMessage.ptt }, { quoted: m });
      }
    } catch (e) {
      await replyText(sock, m, '❌ *Failed to reveal*\n\nMedia may be expired');
    }
  }
};