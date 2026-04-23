import { replyText } from '../../utils/reply.js';

export default {
  name: 'runtime',
  alias: ['uptime'],
  desc: 'Show bot uptime',
  run: async (sock, m) => {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    await replyText(sock, m, `*⏰ Bot Uptime*\n\n${days}d ${hours}h ${minutes}m ${seconds}s\n\n_Powered by TEDDY-XMD_`);
  }
};