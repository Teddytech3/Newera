import axios from 'axios';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'dl',
  alias: ['download'],
  desc: 'Universal downloader',
  run: async (sock, m, args) => {
    const url = args[0];
    if (!url) return replyText(sock, m, '❌ *Usage:*.dl <url>\n\nSupports: YouTube, TikTok, FB, IG, Twitter');

    await sock.sendMessage(m.key.remoteJid, { text: '⏳ *Detecting platform...*' }, { quoted: m });

    try {
      // Auto-detect platform
      let endpoint = 'ytdl/video';
      if (url.includes('tiktok.com')) endpoint = 'tiktok';
      else if (url.includes('facebook.com')) endpoint = 'facebook';
      else if (url.includes('instagram.com')) endpoint = 'instagram';

      const res = await axios.get(`https://api.dreaded.site/api/${endpoint}?url=${encodeURIComponent(url)}`);

      if (!res.data.success) throw new Error('Failed');

      const data = res.data.data;
      const videoUrl = data.downloadUrl || data.video_hd || data.hd || data.media[0]?.url;

      await sock.sendMessage(m.key.remoteJid, {
        video: { url: videoUrl },
        caption: `*📥 Downloaded*\n\n*Title:* ${data.title || data.desc || 'Media'}\n\n_Powered by TEDDY-XMD_`
      }, { quoted: m });

    } catch (e) {
      await replyText(sock, m, '❌ *Download failed*\n\nUnsupported URL or API error');
    }
  }
};