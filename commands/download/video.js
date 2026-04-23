import axios from 'axios';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'video',
  alias: ['ytv', 'ytmp4'],
  desc: 'Download YouTube/TikTok/FB/IG video',
  run: async (sock, m, args) => {
    const url = args[0];
    if (!url) return replyText(sock, m, '❌ *Usage:*.video <url>\n\nSupports: YouTube, TikTok, Facebook, Instagram');

    await sock.sendMessage(m.key.remoteJid, { text: '⏳ *Downloading video...*' }, { quoted: m });

    try {
      // Using public API - replace with your preferred service
      const res = await axios.get(`https://api.dreaded.site/api/ytdl/video?url=${encodeURIComponent(url)}`);

      if (!res.data.success) throw new Error('Download failed');

      const video = res.data.data;
      await sock.sendMessage(m.key.remoteJid, {
        video: { url: video.downloadUrl },
        caption: `*📹 ${video.title}*\n\n*Duration:* ${video.duration}\n*Quality:* ${video.quality}\n\n_Powered by TEDDY-XMD_`,
        mimetype: 'video/mp4'
      }, { quoted: m });

    } catch (e) {
      console.error(e);
      await replyText(sock, m, '❌ *Failed to download*\n\nInvalid URL or API error');
    }
  }
};