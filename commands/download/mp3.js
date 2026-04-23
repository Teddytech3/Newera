import axios from 'axios';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'mp3',
  alias: ['yta', 'ytmp3', 'ytaudio'],
  desc: 'YouTube to MP3',
  run: async (sock, m, args) => {
    const url = args[0];
    if (!url) return replyText(sock, m, '❌ *Usage:*.mp3 <youtube url>');

    await sock.sendMessage(m.key.remoteJid, { text: '⏳ *Converting to MP3...*' }, { quoted: m });

    try {
      const res = await axios.get(`https://api.dreaded.site/api/ytdl/audio?url=${encodeURIComponent(url)}`);

      if (!res.data.success) throw new Error('Failed');

      const data = res.data.data;
      await sock.sendMessage(m.key.remoteJid, {
        audio: { url: data.downloadUrl },
        mimetype: 'audio/mp4',
        fileName: `${data.title}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: data.title,
            body: `Duration: ${data.duration}`,
            thumbnailUrl: data.thumbnail,
            mediaType: 1
          }
        }
      }, { quoted: m });

    } catch (e) {
      await replyText(sock, m, '❌ *Conversion failed*\n\nInvalid YouTube URL');
    }
  }
};