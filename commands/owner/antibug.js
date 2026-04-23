import { Config } from '../../database/models.js';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'antibug',
  desc: 'Anti-bug/crash protection',
  ownerOnly: true,
  run: async (sock, m, args) => {
    const action = args[0];
    if (!action) {
      const status = (await Config.findOne({ key: 'ANTI_BUG' }))?.value;
      return replyText(sock, m, `*Anti-Bug Shield:* ${status? '🟢 ON' : '🔴 OFF'}\n\n.antibug on/off\n\nBlocks crash messages & malicious texts`);
    }

    await Config.updateOne({ key: 'ANTI_BUG' }, { value: action === 'on' }, { upsert: true });
    await replyText(sock, m, `${action === 'on'? '✅' : '❌'} *Anti-Bug Shield ${action.toUpperCase()}*`);
  }
};