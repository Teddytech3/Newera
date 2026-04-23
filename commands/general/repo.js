import axios from 'axios';
import { replyWithMedia } from '../../utils/reply.js';
import { LINKS } from '../../utils/constants.js';

export default {
  name: 'repo',
  alias: ['sc', 'script', 'source', 'github'],
  desc: 'Get bot repository with live stats',
  run: async (sock, m) => {
    await sock.sendMessage(m.key.remoteJid, { text: '⏳ Fetching repository info...' }, { quoted: m });

    try {
      const res = await axios.get('https://api.github.com/repos/Teddytech1/TEDDY-XMD');
      const repo = res.data;

      const created = new Date(repo.created_at).toLocaleDateString();
      const updated = new Date(repo.updated_at).toLocaleDateString();
      const size = (repo.size / 1024).toFixed(2);

      const repoInfo = `*🤖 TEDDY-XMD OFFICIAL REPOSITORY*

*📦 Repo Name:* ${repo.name}
*👤 Owner:* ${repo.owner.login}
*📝 Description:* ${repo.description || 'Multi-device WhatsApp Bot'}

*⭐ Stars:* ${repo.stargazers_count}
*🍴 Forks:* ${repo.forks_count}
*👀 Watchers:* ${repo.watchers_count}
*📊 Size:* ${size} MB
*📅 Created:* ${created}
*🔄 Last Update:* ${updated}
*💻 Language:* ${repo.language}
*📜 License:* ${repo.license?.name || 'MIT'}
*🐛 Issues:* ${repo.open_issues_count}

*🔗 Repository Link:*
${repo.html_url}

*🌟 Features:*
- Multi-Device Support
- 79+ Commands
- Auto Features
- Media Downloaders
- AI Chat
- Group Management
- Anti-Ban Protection
- Pterodactyl + Heroku Ready

*📥 How to Deploy:*
1. Fork the repository
2. Get session ID
3. Deploy to Heroku/Panel
4. Set env variables
5. Start bot

*💡 Support:.report <issue> or.owner*`;

      await sock.sendMessage(m.key.remoteJid, {
        image: { url: LINKS.MENU_IMAGE },
        caption: repoInfo + `\n\n_📢 Join Newsletter: ${LINKS.NEWSLETTER}_\n_Powered by TEDDY-XMD_`,
        contextInfo: {
          externalAdReply: {
            title: 'TEDDY-XMD GitHub',
            body: `⭐ ${repo.stargazers_count} Stars | 🍴 ${repo.forks_count} Forks`,
            thumbnailUrl: repo.owner.avatar_url,
            mediaType: 1,
            mediaUrl: repo.html_url,
            sourceUrl: repo.html_url
          }
        }
      }, { quoted: m });

    } catch (e) {
      console.error('Repo Error:', e);
      await replyWithMedia(sock, m, `*🤖 TEDDY-XMD OFFICIAL REPOSITORY*

*🔗 Repository Link:*
${LINKS.REPO}

*🌟 Features:* 79+ Commands, Auto Features, Downloaders, AI

*📥 Deploy:* Fork → Set env → Deploy to Heroku/Pterodactyl`);
    }
  }
};