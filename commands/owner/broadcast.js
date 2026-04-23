import { replyText } from '../../utils/reply.js';

export default {
  name: 'broadcast',
  alias: ['bc'],
  desc: 'Broadcast message to all groups',
  ownerOnly: true,
  run: async (sock, m, args) => {
    const msg = args.join(' ');
    if (!msg) return replyText(sock, m, '❌ *Usage:*.broadcast Hello everyone');

    const groups = await sock.groupFetchAllParticipating();
    const groupIds = Object.keys(groups);

    await replyText(sock, m, `📢 *Broadcasting to ${groupIds.length} groups...*`);

    let sent = 0;
    for (const id of groupIds) {
      try {
        await sock.sendMessage(id, { text: `*📢 ANNOUNCEMENT*\n\n${msg}\n\n_Powered by TEDDY-XMD_` });
        sent++;
        await new Promise(r => setTimeout(r, 2000));
      } catch (e) {
        console.error(`Failed to send to ${id}`);
      }
    }

    await replyText(sock, m, `✅ *Broadcast Complete*\n\n*Sent to:* ${sent}/${groupIds.length} groups`);
  }
};