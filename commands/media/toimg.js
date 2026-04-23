import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import fs from 'fs';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'toimg',
  alias: ['toimage'],
  desc: 'Convert sticker to image',
  run: async (sock, m) => {
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted?.stickerMessage) {
      return replyText(sock, m, '❌ *Reply to a sticker*\n\nUsage:.toimg (reply to sticker)');
    }

    try {
      const media = await downloadMediaMessage({ message: quoted }, 'buffer', {});
      const temp = `./temp/${Date.now()}`;

      fs.writeFileSync(`${temp}.webp`, media);

      exec(`ffmpeg -i ${temp}.webp ${temp}.png`, async (err) => {
        if (err) throw err;

        const image = fs.readFileSync(`${temp}.png`);
        await sock.sendMessage(m.key.remoteJid, { image, caption: '*🖼️ Sticker to Image*' }, { quoted: m });

        fs.unlinkSync(`${temp}.webp`);
        fs.unlinkSync(`${temp}.png`);
      });

    } catch (e) {
      await replyText(sock, m, '❌ *Conversion failed*');
    }
  }
};