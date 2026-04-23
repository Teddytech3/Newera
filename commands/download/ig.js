import axios from 'axios';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'ig',
  alias: ['instagram', 'igdl', 'reel'],
  desc: 'Download Instagram Reel/Post',
  run: async (sock, m, args) => {
    const [type, url] = args;
    let igUrl = url;

    // Handle:.ig <url> or.ig mp3 <url>
    if (type &&!type.startsWith('http')) {
      igUrl = args[1];
    }

    if (!igUrl) return replyText(sock, m, '❌ *Usage:*\n.ig <url>\n.ig mp3 <url>');

    await sock.sendMessage(m.key.remoteJid, { text: '⏳ *Downloading Instagram...*' }, { quoted: m });

    try {
      const res = await axios.get(`https://api.dreaded.site/api/instagram?url=${encodeURIComponent(igUrl)}`);

      if (!res.data.success) throw new Error('Failed');

      const data = res.data.data;

      if (type === 'mp3') {
        await sock.sendMessage(m.key.remoteJid, {
          audio: { url: data.audio },
          mimetype: 'audio/mp4'
        }, { quoted: m });
      } else {
        if (data.type === 'video') {
          await sock.sendMessage(m.key.remoteJid, {
            video: { url: data.media[0].url },
            caption: `*📷 Instagram Video*\n\n*By:* @${data.username}\n*Caption:* ${data.caption}\n\n_Powered by TEDDY-XMD_`
          }, { quoted: m });
        } else {
          await sock.sendMessage(m.key.remoteJid, {
            image: { url: data.media[0].url },
            caption: `*📷 Instagram Post*\n\n*By:* @${data.username}\n\n_Powered by TEDDY-XMD_`
          }, { quoted: m });
        }
      }

    } catch (e) {
      await replyText(sock, m, '❌ *Download failed*\n\nInvalid Instagram URL');
    }
  }
};