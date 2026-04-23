import { Group } from '../../database/models.js';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'antilink',
  desc: 'Delete links and kick sender',
  run: async (sock, m, args) => {
    if (!m.key.remoteJid.endsWith('@g.us')) return replyText(sock, m, '❌ *Group command only*');

    const action = args[0];
    if (!action) {
      const status = (await Group.findOne({ jid: m.key.remoteJid }))?.antilink;
      return replyText(sock, m, `*Anti-Link:* ${status? '🟢 ON' : '🔴 OFF'}\n\n.antilink on/off`);
    }

    await Group.updateOne({ jid: m.key.remoteJid }, { antilink: action === 'on' }, { upsert: true });
    await replyText(sock, m, `${action === 'on'? '✅' : '❌'} *Anti-Link ${action.toUpperCase()}*`);
  }
};