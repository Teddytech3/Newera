import { replyText } from '../../utils/reply.js';

export default {
  name: 'ping',
  alias: ['p', 'speed'],
  desc: 'Check bot response speed',
  run: async (sock, m) => {
    const start = Date.now();
    const msg = await sock.sendMessage(m.key.remoteJid, { text: '🏓 *Pinging...*' }, { quoted: m });
    const end = Date.now();

    await sock.sendMessage(m.key.remoteJid, {
      text: `*🏓 Pong!*\n\n*Response:* ${end - start}ms\n*Status:* 🟢 Online`,
      edit: msg.key
    });
  }
};