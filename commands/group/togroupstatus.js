import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'togroupstatus',
  alias: ['tgs'],
  desc: 'Post status to all groups',
  ownerOnly: true,
  run: async (sock, m) => {
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) return replyText(sock, m, '❌ *Reply to status/image/video*\n\nUsage:.togroupstatus (reply to media)');

    const groups = await sock.groupFetchAllParticipating();
    const groupIds = Object.keys(groups);

    await replyText(sock, m, `📤 *Posting to ${groupIds.length} groups...*`);

    try {
      const type = Object.keys(quoted)[0];
      let content;

      if (type === 'imageMessage') {
        const media = await downloadMediaMessage({ message: quoted }, 'buffer', {});
        content = { image: media, caption: quoted.imageMessage.caption || '📢 *TEDDY-XMD Status*' };
      } else if (type === 'videoMessage') {
        const media = await downloadMediaMessage({ message: quoted }, 'buffer', {});
        content = { video: media, caption: quoted.videoMessage.caption || '📢 *TEDDY-XMD Status*' };
      } else {
        return replyText(sock, m, '❌ *Only image/video supported*');
      }

      let sent = 0;
      for (const id of groupIds) {
        try {
          await sock.sendMessage(id, content);
          sent++;
          await new Promise(r => setTimeout(r, 2000));
        } catch {}
      }

      await replyText(sock, m, `✅ *Posted to ${sent}/${groupIds.length} groups*`);
    } catch (e) {
      await replyText(sock, m, '❌ *Failed to post status*');
    }
  }
};