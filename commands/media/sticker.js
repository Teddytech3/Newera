import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import fs from 'fs';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'sticker',
  alias: ['s', 'stiker'],
  desc: 'Convert image/video to sticker',
  run: async (sock, m) => {
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted?.imageMessage &&!quoted?.videoMessage) {
      return replyText(sock, m, '❌ *Reply to image/video*\n\nUsage:.sticker (reply to media)');
    }

    await sock.sendMessage(m.key.remoteJid, { text: '⏳ *Creating sticker...*' }, { quoted: m });

    try {
      const media = await downloadMediaMessage({ message: quoted }, 'buffer', {});
      const temp = `./temp/${Date.now()}`;

      fs.writeFileSync(`${temp}.jpg`, media);

      // Use ffmpeg to convert to webp
      exec(`ffmpeg -i ${temp}.jpg -vcodec libwebp -vf scale=512:512 ${temp}.webp`, async (err) => {
        if (err) throw err;

        const sticker = fs.readFileSync(`${temp}.webp`);
        await sock.sendMessage(m.key.remoteJid, { sticker }, { quoted: m });

        // Cleanup
        fs.unlinkSync(`${temp}.jpg`);
        fs.unlinkSync(`${temp}.webp`);
      });

    } catch (e) {
      await replyText(sock, m, '❌ *Failed to create sticker*\n\nEnsure ffmpeg is installed');
    }
  }
};