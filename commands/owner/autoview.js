import { Config } from '../../database/models.js';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'autoview',
  desc: 'Auto view all status',
  ownerOnly: true,
  run: async (sock, m, args) => {
    const action = args[0];
    if (!action) {
      const status = (await Config.findOne({ key: 'AUTO_VIEW_STATUS' }))?.value;
      return replyText(sock, m, `*Auto View Status:* ${status? 'ON' : 'OFF'}\n\n.autoview on/off`);
    }

    await Config.updateOne({ key: 'AUTO_VIEW_STATUS' }, { value: action === 'on' }, { upsert: true });
    await replyText(sock, m, `${action === 'on'? '✅' : '❌'} *Auto View Status ${action.toUpperCase()}*`);
  }
};