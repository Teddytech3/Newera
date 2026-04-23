import { Config } from '../../database/models.js';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'faketype',
  alias: ['faketyping'],
  desc: 'Show typing status before reply',
  ownerOnly: true,
  run: async (sock, m, args) => {
    const action = args[0];
    if (!action) {
      const status = (await Config.findOne({ key: 'FAKE_TYPING' }))?.value;
      return replyText(sock, m, `*Fake Typing:* ${status? '🟢 ON' : '🔴 OFF'}\n\n.faketype on/off`);
    }

    await Config.updateOne({ key: 'FAKE_TYPING' }, { value: action === 'on' }, { upsert: true });
    await replyText(sock, m, `${action === 'on'? '✅' : '❌'} *Fake Typing ${action.toUpperCase()}*`);
  }
};