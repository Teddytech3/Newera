import { Config } from '../../database/models.js';
import { config } from '../../config.js';
import { replyWithMedia } from '../../utils/reply.js';
import { LINKS } from '../../utils/constants.js';

export default {
  name: 'menu',
  alias: ['help','allmenu','list','commands'],
  desc: 'Show all features and commands',
  run: async (sock, m) => {
    const settings = {};
    const keys = ['AUTO_VIEW_STATUS','AUTO_LIKE_STATUS','ANTI_DELETE','ALWAYS_ONLINE','ANTI_CALL','ANTI_BUG','FAKE_TYPING','FAKE_RECORDING','AUTO_READ','CHATBOT'];

    for (const key of keys) {
      settings[key] = (await Config.findOne({ key }))?.value?? config[key]?? false;
    }

    const antiDeleteConfig = (await Config.findOne({ key: 'ANTI_DELETE_CONFIG' }))?.value || { enabled: false, scope: 'all' };
    const autoReactConfig = (await Config.findOne({ key: 'AUTO_REACT_CONFIG' }))?.value || { enabled: false };

    const on = '🟢'; const off = '🔴';
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600), min = Math.floor((uptime % 3600) / 60);

    const menu = `
╔════════════════════════════════════╗
║ 🤖 *TEDDY-XMD v2.0* 🤖 ║
║ _Premium WhatsApp Bot_ ║
╚════════════════════════════════════╝

┌─❏ *📊 BOT INFO* ❏─
│ • *Name:* ${sock.user.name}
│ • *Number:* +${sock.user.id.split(':')[0]}
│ • *Owner:* +${config.OWNER_NUMBER}
│ • *Prefix:* ${config.PREFIX}
│ • *Uptime:* ${h}h ${min}m
│ • *Commands:* 79+
└─────────────────────

┌─❏ *⚡ AUTO FEATURES* ❏─
│ ${settings.AUTO_VIEW_STATUS? on : off} Auto View Status
│ ${settings.AUTO_LIKE_STATUS? on : off} Auto Like Status
│ ${antiDeleteConfig.enabled? on : off} Anti-Delete (${antiDeleteConfig.scope})
│ ${autoReactConfig.enabled? on : off} Auto-React Status
│ ${settings.ALWAYS_ONLINE? on : off} Always Online
│ ${settings.AUTO_READ? on : off} Auto Read
└─────────────────────

┌─❏ *🎭 FAKE & SECURITY* ❏─
│ ${settings.FAKE_RECORDING? on : off} Fake Recording
│ ${settings.FAKE_TYPING? on : off} Fake Typing
│ ${settings.ANTI_CALL? on : off} Anti-Call
│ ${settings.ANTI_BUG? on : off} Anti-Bug Shield
│ ${settings.CHATBOT? on : off} Chatbot DM
└─────────────────────

┌─❏ *⬇️ DOWNLOADS* ❏─
│ *Videos:*
│ •.video <url> - YouTube/TikTok/FB/IG
│ •.tiktok <url> - TikTok HD
│ •.fb <url> - Facebook
│ •.ig <url> - Instagram Reel
│ •.dl <url> - Universal
│
│ *Audio:*
│ •.song <name> - Search & Download
│ •.mp3 <url> - YouTube to MP3
│ •.tiktok mp3 <url> - TikTok Audio
└─────────────────────

┌─❏ *📸 MEDIA TOOLS* ❏─
│ •.vv - Reveal View-Once
│ •.vv2 - Save View-Once to DM
│ •.savestatus - Download Status
│ •.tourl - Image to URL
│ •.sticker - Image/Video to Sticker
│ •.toimg - Sticker to Image
└─────────────────────

┌─❏ *🤖 AI FEATURES* ❏─
│ •.ai <question> - AI Chat
│ •.gpt <prompt> - ChatGPT
│ •.gemini <prompt> - Google Gemini
│ •.tts <text> - Text to Speech
│ •.imagine <prompt> - AI Image
└─────────────────────

┌─❏ *👥 GROUP TOOLS* ❏─
│ •.antidelete on/off - Anti-Delete
│ •.autoreact on/off - Auto-React
│ •.welcome on/off - Welcome Msg
│ •.antilink on/off - Anti Link
│ •.tagall <msg> - Tag Everyone
│ •.hidetag <msg> - Hidden Tag
│ •.kick @user - Remove Member
│ •.promote @user - Make Admin
│ •.demote @user - Remove Admin
└─────────────────────

┌─❏ *👑 OWNER ONLY* ❏─
│ •.addbot <session> - Connect Bot
│ •.listbots - Show All Bots
│ •.removebot <phone> - Remove Bot
│ •.broadcast <msg> - Send to Groups
│ •.ban @user - Ban User
│ •.restart - Restart Bot
└─────────────────────

┌─❏ *🔧 UTILITIES* ❏─
│ •.ping - Check Speed
│ •.stats - Bot Statistics
│ •.runtime - Uptime
│ •.owner - Contact Owner
│ •.report <msg> - Report Issue
│ •.repo - Get Source Code
│ •.jid - Get Chat JID
│ •.qr <text> - Generate QR
└─────────────────────

╔════════════════════════════════════╗
║ 🌐 *LINKS & RESOURCES* ║
╠════════════════════════════════════╣
║ 📢 Newsletter: ${LINKS.NEWSLETTER} ║
║ 🔗 GitHub: ${LINKS.REPO} ║
╚════════════════════════════════════╝

*💡 QUICK COMMANDS:*
.antidelete on private - Enable for DMs
.autoreact set ❤️ 🔥 😍 - Set emojis
.tiktok https://vm.tiktok.com/abc
.vv (reply to view-once)

*TEDDY-XMD v2.0 | Powered by Baileys*`;

    await replyWithMedia(sock, m, menu);
  }
};