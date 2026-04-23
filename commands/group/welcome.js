import { Group } from '../../database/models.js';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'welcome',
  desc: 'Toggle welcome/goodbye messages',
  run: async (sock, m, args) => {
    if (!m.key.remoteJid.endsWith('@g.us')) return replyText(sock, m, '❌ *Group command only*');

    const action = args[0];
    if (!action) {
      const status = (await Group.findOne({ jid: m.key.remoteJid }))?.welcome;
      return replyText(sock, m, `*Welcome:* ${status? '🟢 ON' : '🔴 OFF'}\n\n.welcome on/off`);
    }

    await Group.updateOne({ jid: m.key.remoteJid }, { welcome: action === 'on' }, { upsert: true });
    await replyText(sock, m, `${action === 'on'? '✅' : '❌'} *Welcome messages ${action.toUpperCase()}*`);
  }
};