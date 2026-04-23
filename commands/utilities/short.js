import axios from 'axios';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'short',
  alias: ['shorturl', 'tinyurl'],
  desc: 'Shorten long URL',
  run: async (sock, m, args) => {
    const url = args[0];
    if (!url) return replyText(sock, m, '❌ *Usage:*.short <url>\n\nExample:.short https://very-long-url.com/abc123');

    try {
      const res = await axios.get(`https://api.dreaded.site/api/shorturl?url=${encodeURIComponent(url)}`);

      if (!res.data.success) throw new Error('Failed');

      await replyText(sock, m, `*🔗 URL Shortened*\n\n*Original:* ${url}\n*Short:* ${res.data.shortened}\n\n_Powered by TEDDY-XMD_`);
    } catch (e) {
      await replyText(sock, m, '❌ *Failed to shorten URL*\n\nInvalid URL');
    }
  }
};