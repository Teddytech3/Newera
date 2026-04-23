import QRCode from 'qrcode';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'qr',
  alias: ['qrcode'],
  desc: 'Generate QR code from text',
  run: async (sock, m, args) => {
    const text = args.join(' ');
    if (!text) return replyText(sock, m, '❌ *Usage:*.qr <text>\n\nExample:.qr https://github.com');

    try {
      const qrBuffer = await QRCode.toBuffer(text, { width: 512 });
      await sock.sendMessage(m.key.remoteJid, {
        image: qrBuffer,
        caption: `*📱 QR Code*\n\n*Text:* ${text}\n\n_Powered by TEDDY-XMD_`
      }, { quoted: m });
    } catch (e) {
      await replyText(sock, m, '❌ *Failed to generate QR*');
    }
  }
};