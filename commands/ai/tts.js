import axios from 'axios';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'tts',
  alias: ['speak', 'say'],
  desc: 'Text to Speech',
  run: async (sock, m, args) => {
    const [lang,...textArr] = args;
    const text = textArr.join(' ');

    if (!text) return replyText(sock, m, '❌ *Usage:*.tts <lang> <text>\n\nExample:.tts en Hello world\n\n*Langs:* en, es, fr, sw, hi, ar');

    await sock.sendMessage(m.key.remoteJid, { text: '🔊 *Generating audio...*' }, { quoted: m });

    try {
      const res = await axios.get(`https://api.dreaded.site/api/tts?text=${encodeURIComponent(text)}&lang=${lang}`, {
        responseType: 'arraybuffer'
      });

      await sock.sendMessage(m.key.remoteJid, {
        audio: Buffer.from(res.data),
        mimetype: 'audio/mp4',
        ptt: true
      }, { quoted: m });

    } catch (e) {
      await replyText(sock, m, '❌ *TTS failed*\n\nInvalid language or text too long');
    }
  }
};