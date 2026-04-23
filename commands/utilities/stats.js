import os from 'os';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'stats',
  alias: ['system', 'server'],
  desc: 'Show bot system statistics',
  run: async (sock, m) => {
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const min = Math.floor((uptime % 3600) / 60);
    const sec = Math.floor(uptime % 60);

    const totalMem = (os.totalmem() / 1024).toFixed(2);
    const freeMem = (os.freemem() / 1024).toFixed(2);
    const usedMem = (totalMem - freeMem).toFixed(2);
    const cpuUsage = process.cpuUsage();
    const cpuPercent = ((cpuUsage.user + cpuUsage.system) / 1000000).toFixed(2);

    const stats = `*📊 TEDDY-XMD STATS*\n\n*⏰ Uptime:* ${h}h ${min}m ${sec}s\n*💾 RAM:* ${usedMem}GB / ${totalMem}GB\n*💻 CPU:* ${cpuPercent}%\n*🖥️ Platform:* ${os.platform()} ${os.arch()}\n*📦 Node:* ${process.version}\n*🤖 Baileys:* Latest\n\n*📱 WhatsApp:* +${sock.user.id.split(':')[0]}\n*👤 Owner:* +${process.env.OWNER_NUMBER}`;

    await replyText(sock, m, stats);
  }
};