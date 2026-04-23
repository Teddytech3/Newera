import { downloadMediaMessage } from '@whiskeysockets/baileys';
import axios from 'axios';
import FormData from 'form-data';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'tourl',
  alias: ['upload', 'url'],
  desc: 'Upload image/video to URL',
  run: async (sock, m) => {
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted?.imageMessage &&!quoted?.videoMessage) {
      return replyText(sock, m, '❌ *Reply to an image or video*\n\nUsage:.tourl (reply to media)');
    }

    await sock.sendMessage(m.key.remoteJid, { text: '⏳ *Uploading...*' }, { quoted: m });

    try {
      const media = await downloadMediaMessage({ message: quoted }, 'buffer', {});
      const form = new FormData();
      form.append('file', media, { filename: 'upload.jpg' });

      const res = await axios.post('https://api.dreaded.site/api/upload', form, {
        headers: form.getHeaders()
      });

      if (!res.data.success) throw new Error('Upload failed');

      await replyText(sock, m, `*🔗 Upload Success*\n\n*URL:* ${res.data.url}\n*Size:* ${res.data.size}\n\n_Powered by TEDDY-XMD_`);
    } catch (e) {
      await replyText(sock, m, '❌ *Upload failed*\n\nTry again later');
    }
  }
};