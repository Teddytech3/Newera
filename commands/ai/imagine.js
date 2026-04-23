import axios from 'axios';
import { replyWithMedia } from '../../utils/reply.js';

export default {
  name: 'imagine',
  alias: ['img', 'gen', 'dalle'],
  desc: 'AI Image Generator',
  run: async (sock, m, args) => {
    const prompt = args.join(' ');
    if (!prompt) return replyText(sock, m, '❌ *Usage:*.imagine <prompt>\n\nExample:.imagine A cyberpunk city at night');

    await sock.sendMessage(m.key.remoteJid, { text: '🎨 *Generating image...*\n\nThis may take 10-30 seconds' }, { quoted: m });

    try {
      const res = await axios.get(`https://api.dreaded.site/api/imagine?prompt=${encodeURIComponent(prompt)}`, {
        responseType: 'arraybuffer'
      });

      await sock.sendMessage(m.key.remoteJid, {
        image: Buffer.from(res.data),
        caption: `*🎨 AI Generated*\n\n*Prompt:* ${prompt}\n\n_Powered by TEDDY-XMD_`
      }, { quoted: m });

    } catch (e) {
      await replyWithMedia(sock, m, '❌ *Image generation failed*\n\nPrompt may be blocked or server busy');
    }
  }
};