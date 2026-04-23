import { Config } from '../../database/models.js';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'alwaysonline',
  alias: ['online'],
  desc: 'Keep bot always online',
  ownerOnly: true,
  run: async (sock, m, args) => {
    const action = args[0];
    if (!action) {
      const status = (await Config.findOne({ key: 'ALWAYS_ONLINE' }))?.value;
      return replyText(sock, m, `*Always Online:* ${status? '🟢 ON' : '🔴 OFF'}\n\n.alwaysonline on/off`);
    }

    await Config.updateOne({ key: 'ALWAYS_ONLINE' }, { value: action === 'on' }, { upsert: true });

    if (action === 'on') {
      await sock.sendPresenceUpdate('available');
      setInterval(() => sock.sendPresenceUpdate('available'), 10000);
    }

    await replyText(sock, m, `${action === 'on'? '✅' : '❌'} *Always Online ${action.toUpperCase()}*`);
  }
};