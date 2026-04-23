export default {
  name: 'hidetag',
  alias: ['ht'],
  desc: 'Tag all members without showing mentions',
  run: async (sock, m, args) => {
    if (!m.key.remoteJid.endsWith('@g.us')) return;

    const group = await sock.groupMetadata(m.key.remoteJid);
    const participants = group.participants.map(p => p.id);
    const text = args.join(' ') || '';

    await sock.sendMessage(m.key.remoteJid, {
      text: text,
      mentions: participants
    }, { quoted: m });
  }
};