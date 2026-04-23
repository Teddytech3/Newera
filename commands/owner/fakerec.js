import { Config } from '../../database/models.js';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'fakerec',
  alias: ['fakerecording'],
  desc: 'Show recording status before reply',
  ownerOnly: true,
  run: async (sock, m, args) => {
    const action = args[0];
    if (!action) {
      const status = (await Config.findOne({ key: 'FAKE_RECORDING' }))?.value;
      return replyText(sock, m, `*Fake Recording:* ${status? '🟢 ON' : '🔴 OFF'}\n\n.fakerec on/off`);
    }

    await Config.updateOne({ key: 'FAKE_RECORDING' }, { value: action === 'on' }, { upsert: true });
    await replyText(sock, m, `${action === 'on'? '✅' : '❌'} *Fake Recording ${action.toUpperCase()}*`);
  }
};