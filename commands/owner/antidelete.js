import { Config } from '../../database/models.js';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'antidelete',
  alias: ['ad'],
  desc: 'Configure anti-delete for groups/private',
  ownerOnly: true,
  run: async (sock, m, args) => {
    const [action, scope,...textParts] = args;
    const customText = textParts.join(' ');

    let config = (await Config.findOne({ key: 'ANTI_DELETE_CONFIG' }))?.value || {
      enabled: false,
      scope: 'all',
      text: '⚠️ *Anti-Delete Alert*\n\n*User:* @{user}\n*Time:* {time}\n*Deleted message recovered*'
    };

    if (!action) {
      return replyText(sock, m, `*🛡️ Anti-Delete Settings*

*Status:* ${config.enabled? '🟢 ON' : '🔴 OFF'}
*Scope:* ${config.scope}
*Custom Text:* ${config.text}

*Usage:*
.antidelete on [all/group/private]
.antidelete off
.antidelete text <message>

*Variables:* {user}, {time}, {chat}`);
    }

    if (action === 'on') {
      config.enabled = true;
      config.scope = scope || 'all';
      await Config.updateOne({ key: 'ANTI_DELETE_CONFIG' }, { value: config }, { upsert: true });
      return replyText(sock, m, `✅ *Anti-Delete Enabled*\n\n*Scope:* ${config.scope}\nNow recovering deleted messages.`);
    }

    if (action === 'off') {
      config.enabled = false;
      await Config.updateOne({ key: 'ANTI_DELETE_CONFIG' }, { value: config }, { upsert: true });
      return replyText(sock, m, `❌ *Anti-Delete Disabled*`);
    }

    if (action === 'text') {
      if (!customText) return replyText(sock, m, '❌ Provide custom text');
      config.text = customText;
      await Config.updateOne({ key: 'ANTI_DELETE_CONFIG' }, { value: config }, { upsert: true });
      return replyText(sock, m, `✅ *Custom Text Updated*\n\n${customText}`);
    }
  }
};