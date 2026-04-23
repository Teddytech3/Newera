import { Config } from '../../database/models.js';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'autoreact',
  alias: ['ar', 'autolike'],
  desc: 'Auto react to status with custom emojis',
  ownerOnly: true,
  run: async (sock, m, args) => {
    const [action,...emojis] = args;
    let config = (await Config.findOne({ key: 'AUTO_REACT_CONFIG' }))?.value || {
      enabled: false,
      emojis: ['❤️', '🔥', '😂', '😮', '😢', '🙏']
    };

    if (!action) {
      return replyText(sock, m, `*💫 Auto-React Status*

*Status:* ${config.enabled? '🟢 ON' : '🔴 OFF'}
*Emojis:* ${config.emojis.join(' ')}

*Usage:*
.autoreact on
.autoreact off
.autoreact set ❤️ 🔥 😍
.autoreact add 💯`);
    }

    if (action === 'on') {
      config.enabled = true;
      await Config.updateOne({ key: 'AUTO_REACT_CONFIG' }, { value: config }, { upsert: true });
      return replyText(sock, m, `✅ *Auto-React Enabled*\n\n*Emojis:* ${config.emojis.join(' ')}`);
    }

    if (action === 'off') {
      config.enabled = false;
      await Config.updateOne({ key: 'AUTO_REACT_CONFIG' }, { value: config }, { upsert: true });
      return replyText(sock, m, `❌ *Auto-React Disabled*`);
    }

    if (action === 'set') {
      if (!emojis.length) return replyText(sock, m, '❌ Provide emojis');
      config.emojis = emojis;
      await Config.updateOne({ key: 'AUTO_REACT_CONFIG' }, { value: config }, { upsert: true });
      return replyText(sock, m, `✅ *Emojis Updated*\n\n${emojis.join(' ')}`);
    }

    if (action === 'add') {
      const emoji = emojis[0];
      if (!config.emojis.includes(emoji)) config.emojis.push(emoji);
      await Config.updateOne({ key: 'AUTO_REACT_CONFIG' }, { value: config }, { upsert: true });
      return replyText(sock, m, `✅ *Emoji Added*\n\n*Current:* ${config.emojis.join(' ')}`);
    }
  }
};