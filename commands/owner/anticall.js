import { Config } from '../../database/models.js';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'anticall',
  desc: 'Auto reject incoming calls',
  ownerOnly: true,
  run: async (sock, m, args) => {
    const action = args[0];
    if (!action) {
      const status = (await Config.findOne({ key: 'ANTI_CALL' }))?.value;
      return replyText(sock, m, `*Anti-Call:* ${status? '🟢 ON' : '🔴 OFF'}\n\n.anticall on/off`);
    }

    await Config.updateOne({ key: 'ANTI_CALL' }, { value: action === 'on' }, { upsert: true });
    await replyText(sock, m, `${action === 'on'? '✅' : '❌'} *Anti-Call ${action.toUpperCase()}*\n\n${action === 'on'? 'Calls will be auto-rejected' : 'Calls allowed'}`);
  }
};