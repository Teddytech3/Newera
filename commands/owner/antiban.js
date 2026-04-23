import { Config } from '../../database/models.js';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'antiban',
  desc: 'Anti-ban protection mode',
  ownerOnly: true,
  run: async (sock, m, args) => {
    const action = args[0];
    if (!action) {
      const status = (await Config.findOne({ key: 'ANTI_BAN_MODE' }))?.value;
      return replyText(sock, m, `*Anti-Ban Mode:* ${status? '🟢 ON' : '🔴 OFF'}\n\n.antiban on/off\n\nAdds delays & randomizes actions`);
    }

    await Config.updateOne({ key: 'ANTI_BAN_MODE' }, { value: action === 'on' }, { upsert: true });
    await replyText(sock, m, `${action === 'on'? '✅' : '❌'} *Anti-Ban Mode ${action.toUpperCase()}*\n\n${action === 'on'? 'Bot will use safe delays' : 'Full speed mode'}`);
  }
};