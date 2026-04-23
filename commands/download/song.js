import axios from 'axios';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'song',
  alias: ['play', 'music'],
  desc: 'Search and download MP3',
  run: async (sock, m, args) => {
    const query = args.join(' ');
    if (!query) return replyText(sock, m, '❌ *Usage:*.song <song name>\n\nExample:.song despacito');

    await sock.sendMessage(m.key.remoteJid, { text: `🔍 *Searching:* ${query}...` }, { quoted: m });

    try {
      const search = await axios.get(`https://api.dreaded.site/api/youtube/search?query=${encodeURIComponent(query)}`);
      if (!search.data.success) throw new Error('Search failed');

      const video = search.data.data[0];
      await sock.sendMessage(m.key.remoteJid, { text: `⏳ *Downloading:* ${video.title}` }, { quoted: m });

      const dl = await axios.get(`https://api.dreaded.site/api/ytdl/audio?url=${video.url}`);
      if (!dl.data.success) throw new Error('Download failed');

      await sock.sendMessage(m.key.remoteJid, {
        audio: { url: dl.data.data.downloadUrl },
        mimetype: 'audio/mp4',
        fileName: `${video.title}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: video.title,
            body: `Duration: ${video.duration}`,
            thumbnailUrl: video.thumbnail,
            mediaType: 1,
            mediaUrl: video.url
          }
        }
      }, { quoted: m });

    } catch (e) {
      await replyText(sock, m, '❌ *Song not found*\n\nTry different keywords');
    }
  }
};