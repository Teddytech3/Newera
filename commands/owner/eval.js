import { replyText } from '../../utils/reply.js';

export default {
  name: 'eval',
  alias: ['ev', '>'],
  desc: 'Execute JavaScript code',
  ownerOnly: true,
  run: async (sock, m, args) => {
    const code = args.join(' ');
    if (!code) return replyText(sock, m, '❌ *Provide code*\n\n.eval console.log("test")');

    try {
      let result = await eval(`(async () => { ${code} })()`);
      if (typeof result!== 'string') result = require('util').inspect(result);
      await replyText(sock, m, `*📥 Input:*\n\`\`\`${code}\`\`\`\n\n*📤 Output:*\n\`\`\`${result}\`\`\``);
    } catch (e) {
      await replyText(sock, m, `*❌ Error:*\n\`\`\`${e.message}\`\`\``);
    }
  }
};