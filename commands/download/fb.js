import axios from 'axios';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'fb',
  alias: ['facebook', 'fbdl'],
  desc: 'Download Facebook video',
  run: async (sock, m, args) => {
    const [type, url] = args;
    let fbUrl = url;

    // Handle:.fb <url> or.fb mp3 <url>
    if (type &&!type.startsWith('http')) {
      fbUrl = args[1];
    }

    if (!fbUrl) return replyText(sock, m, '❌ *Usage:*\n.fb <url>\n.fb mp3 <url>');

    await sock.sendMessage(m.key.remoteJid, { text: '⏳ *Downloading Facebook...*' }, { quoted: m });

    try {
      const res = await axios.get(`https://api.dreaded.site/api/facebook?url=${encodeURIComponent(fbUrl)}`);

      if (!res.data.success) throw new Error('Failed');

      const data = res.data.data;

      if (type === 'mp3') {
        await sock.sendMessage(m.key.remoteJid, {
          audio: { url: data.audio },
          mimetype: 'audio/mp4'
        }, { quoted: m });
      } else {
        await sock.sendMessage(m.key.remoteJid, {
          video: { url: data.hd },
          caption: `*📘 Facebook Video*\n\n*Title:* ${data.title}\n\n_Powered by TEDDY-XMD_`
        }, { quoted: m });
      }

    } catch (e) {
      await replyText(sock, m, '❌ *Download failed*\n\nInvalid Facebook URL');
    }
  }
};