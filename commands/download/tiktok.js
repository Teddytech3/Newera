import axios from 'axios';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'tiktok',
  alias: ['tt', 'tiktokdl'],
  desc: 'Download TikTok video/audio',
  run: async (sock, m, args) => {
    const [type, url] = args;
    let videoUrl = url;

    // Handle:.tiktok <url> or.tiktok mp3 <url>
    if (type &&!type.startsWith('http')) {
      videoUrl = args[1];
    }

    if (!videoUrl) return replyText(sock, m, '❌ *Usage:*\n.tiktok <url>\n.tiktok mp3 <url>');

    await sock.sendMessage(m.key.remoteJid, { text: '⏳ *Processing TikTok...*' }, { quoted: m });

    try {
      const res = await axios.get(`https://api.dreaded.site/api/tiktok?url=${encodeURIComponent(videoUrl)}`);

      if (!res.data.success) throw new Error('Failed');

      const data = res.data.data;

      // If mp3 requested
      if (type === 'mp3') {
        await sock.sendMessage(m.key.remoteJid, {
          audio: { url: data.music },
          mimetype: 'audio/mp4',
          ptt: false
        }, { quoted: m });
      } else {
        await sock.sendMessage(m.key.remoteJid, {
          video: { url: data.video_hd },
          caption: `*🎵 TikTok Video*\n\n*Author:* @${data.author}\n*Desc:* ${data.desc}\n\n_Powered by TEDDY-XMD_`
        }, { quoted: m });
      }

    } catch (e) {
      await replyText(sock, m, '❌ *Download failed*\n\nInvalid TikTok URL');
    }
  }
};