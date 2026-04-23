import { Config } from '../../database/models.js';
import { replyText } from '../../utils/reply.js';
import moment from 'moment-timezone';

export default {
  name: 'autobio',
  desc: 'Auto update bio with time/uptime',
  ownerOnly: true,
  run: async (sock, m, args) => {
    const action = args[0];
    if (!action) {
      const status = (await Config.findOne({ key: 'AUTO_BIO' }))?.value;
      return replyText(sock, m, `*Auto Bio:* ${status? '🟢 ON' : '🔴 OFF'}\n\n.autobio on/off\n\nUpdates bio every 10min with time`);
    }

    await Config.updateOne({ key: 'AUTO_BIO' }, { value: action === 'on' }, { upsert: true });

    if (action === 'on') {
      // Start auto bio interval
      setInterval(async () => {
        const enabled = (await Config.findOne({ key: 'AUTO_BIO' }))?.value;
        if (!enabled) return;

        const time = moment().tz('Africa/Nairobi').format('HH:mm:ss');
        const uptime = process.uptime();
        const h = Math.floor(uptime / 3600);
        const min = Math.floor((uptime % 3600) / 60);

        await sock.updateProfileStatus(`🤖 TEDDY-XMD | ⏰ ${time} | ⬆️ ${h}h ${min}m`);
      }, 600000); // 10 minutes
    }

    await replyText(sock, m, `${action === 'on'? '✅' : '❌'} *Auto Bio ${action.toUpperCase()}*`);
  }
};