import { Config } from '../database/models.js';
import { getMessageText, replyText } from '../utils/reply.js';

const run = async (sock) => {
  // Store for anti-delete
  const messageStore = new Map();
  const statusStore = new Map();

  // 1. MESSAGE HANDLER - Auto React, Anti-Delete, Chatbot, Status
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const m of messages) {
      if (!m.message) continue;

      // Auto View + React to Status
      if (m.key.remoteJid === 'status@broadcast' &&!m.key.fromMe) {
        const autoView = (await Config.findOne({ key: 'AUTO_VIEW_STATUS' }))?.value;
        const autoReact = (await Config.findOne({ key: 'AUTO_REACT_CONFIG' }))?.value;

        if (autoView) {
          await sock.readMessages([m.key]);

          if (autoReact?.enabled) {
            const emojis = autoReact.emojis || ['❤️', '🔥', '😂', '😮', '😢', '🙏'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

            await sock.sendMessage(m.key.remoteJid, {
              react: { text: randomEmoji, key: m.key }
            });
          }
        }
        return;
      }

      // Store message for Anti-Delete
      if (m.message && m.key.remoteJid!== 'status@broadcast') {
        messageStore.set(m.key.id, {
          message: m.message,
          sender: m.key.participant || m.key.remoteJid,
          timestamp: Date.now(),
          chat: m.key.remoteJid
        });

        // Clean old messages after 24h
        setTimeout(() => messageStore.delete(m.key.id), 24 * 60 * 60 * 1000);
      }

      // Fake Typing/Recording
      if (!m.key.fromMe) {
        const fakeTyping = (await Config.findOne({ key: 'FAKE_TYPING' }))?.value;
        const fakeRecording = (await Config.findOne({ key: 'FAKE_RECORDING' }))?.value;

        if (fakeTyping) {
          await sock.sendPresenceUpdate('composing', m.key.remoteJid);
          setTimeout(() => sock.sendPresenceUpdate('paused', m.key.remoteJid), 3000);
        } else if (fakeRecording) {
          await sock.sendPresenceUpdate('recording', m.key.remoteJid);
          setTimeout(() => sock.sendPresenceUpdate('paused', m.key.remoteJid), 3000);
        }
      }

      // Chatbot - Reply to DMs
      if (!m.key.fromMe &&!m.key.remoteJid.endsWith('@g.us')) {
        const chatbot = (await Config.findOne({ key: 'CHATBOT' }))?.value;
        const prefix = (await Config.findOne({ key: 'PREFIX' }))?.value || '.';
        const text = getMessageText(m);

        if (chatbot &&!text.startsWith(prefix)) {
          const replies = [
            "Hey! I'm TEDDY-XMD 🤖 How can I help?",
            "Hello! Type.menu to see my commands",
            "Hi there! I'm a WhatsApp bot powered by Teddy Tech",
            "Yo! Need help? Use.help"
          ];
          const reply = replies[Math.floor(Math.random() * replies.length)];
          await sock.sendMessage(m.key.remoteJid, { text: reply }, { quoted: m });
        }
      }
    }
  });

  // 2. ANTI-DELETE - Restore deleted messages
  sock.ev.on('messages.update', async (updates) => {
    for (const update of updates) {
      if (update.update?.message === null && update.key?.id) {
        const antiDelete = (await Config.findOne({ key: 'ANTI_DELETE_CONFIG' }))?.value;
        if (!antiDelete?.enabled) continue;

        const stored = messageStore.get(update.key.id);
        if (!stored) continue;

        const isGroup = update.key.remoteJid.endsWith('@g.us');
        const scope = antiDelete.scope || 'group';

        if (scope === 'group' &&!isGroup) continue;
        if (scope === 'dm' && isGroup) continue;

        const sender = stored.sender.split('@')[0];
        const time = new Date(stored.timestamp).toLocaleString('en-US', { timeZone: 'Africa/Nairobi' });
        const chatName = isGroup? (await sock.groupMetadata(stored.chat)).subject : 'Private Chat';

        const text = antiDelete.text
         .replace('{user}', '@' + sender)
         .replace('{time}', time)
         .replace('{chat}', chatName);

        const targetJid = scope === 'owner'
         ? (await Config.findOne({ key: 'OWNER_NUMBER' }))?.value + '@s.whatsapp.net'
          : stored.chat;

        await sock.sendMessage(targetJid, {
          text: text,
          mentions: [stored.sender]
        });

        // Resend original message
        await sock.relayMessage(targetJid, stored.message, {});
      }
    }
  });

  // 3. GROUP PARTICIPANTS - Welcome/Goodbye
  sock.ev.on('group-participants.update', async (update) => {
    const { id, participants, action } = update;

    try {
      const metadata = await sock.groupMetadata(id);
      const groupName = metadata.subject;

      for (const user of participants) {
        const userNum = user.split('@')[0];

        if (action === 'add') {
          const welcomeText = `*👋 Welcome @${userNum}*\n\n*Group:* ${groupName}\n*Members:* ${metadata.participants.length}\n\nType.menu to see commands`;
          await sock.sendMessage(id, {
            text: welcomeText,
            mentions: [user]
          });
        } else if (action === 'remove') {
          const goodbyeText = `*👋 Goodbye @${userNum}*\n\nLeft *${groupName}*\n*Members:* ${metadata.participants.length - 1}`;
          await sock.sendMessage(id, {
            text: goodbyeText,
            mentions: [user]
          });
        }
      }
    } catch (e) {
      console.error('Group update error:', e.message);
    }
  });

  // 4. CALL HANDLER - Anti Call
  sock.ev.on('call', async (calls) => {
    const antiCall = (await Config.findOne({ key: 'ANTI_CALL' }))?.value;
    if (!antiCall) return;

    for (const call of calls) {
      if (call.status === 'offer') {
        await sock.rejectCall(call.id, call.from);
        await sock.sendMessage(call.from, {
          text: '❌ *Calls are not allowed*\n\nI am a WhatsApp bot. Please send text messages only.\n\nType.menu for commands'
        });
      }
    }
  });

  // 5. PRESENCE - Always Online
  setInterval(async () => {
    const alwaysOnline = (await Config.findOne({ key: 'ALWAYS_ONLINE' }))?.value;
    if (alwaysOnline && global.sock) {
      await global.sock.sendPresenceUpdate('available');
    }
  }, 10000);

  // 6. ANTI-BUG - Detect and block crash messages
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const antiBug = (await Config.findOne({ key: 'ANTI_BUG' }))?.value;
    if (!antiBug) return;

    for (const m of messages) {
      if (m.key.fromMe) continue;

      const text = getMessageText(m);
      const bugPatterns = [
        /.{5000,}/, // Over 5000 chars
        /[\u200B-\u200D\uFEFF]{10,}/, // Zero-width chars
        /(.)\1{100,}/, // Repeated chars
      ];

      if (bugPatterns.some(pattern => pattern.test(text))) {
        console.log('🚨 Bug message detected from:', m.key.remoteJid);
        await sock.sendMessage(m.key.remoteJid, {
          text: '⚠️ *Bug Message Blocked*\n\nPotential crash attempt detected and blocked.'
        });

        if (m.key.remoteJid.endsWith('@g.us')) {
          const isBotAdmin = await isAdmin(sock, m.key.remoteJid, sock.user.id);
          const sender = m.key.participant || m.key.remoteJid;
          const isSenderAdmin = await isAdmin(sock, m.key.remoteJid, sender);

          if (isBotAdmin &&!isSenderAdmin) {
            await sock.groupParticipantsUpdate(m.key.remoteJid, [sender], 'remove');
            await sock.sendMessage(m.key.remoteJid, {
              text: `🚫 @${sender.split('@')[0]} removed for sending bug message`,
              mentions: [sender]
            });
          }
        }
      }
    }
  });
};

export default { run };