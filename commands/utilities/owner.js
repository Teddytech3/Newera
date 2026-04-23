import { config } from '../../config.js';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'owner',
  alias: ['creator'],
  desc: 'Contact bot owner',
  run: async (sock, m) => {
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:Teddy Tech\nORG:TEDDY-XMD;\nTEL;type=CELL;type=VOICE;waid=${config.OWNER_NUMBER}:+${config.OWNER_NUMBER}\nEND:VCARD`;

    await sock.sendMessage(m.key.remoteJid, {
      contacts: {
        displayName: 'Teddy Tech',
        contacts: [{ vcard }]
      }
    }, { quoted: m });

    await replyText(sock, m, `*👑 Owner Contact*\n\n*Name:* Teddy Tech\n*Number:* +${config.OWNER_NUMBER}\n\n_Report issues with.report command_`);
  }
};