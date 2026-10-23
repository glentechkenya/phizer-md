module.exports = {
  name: 'tagall',
  description: 'Mention group members (admins only)',
  async execute({ sock, from, msg, args }) {
    if (!from.endsWith('@g.us')) {
      return sock.sendMessage(from, { text: 'This command only works in groups.' });
    }

    const meta = await sock.groupMetadata(from);
    const sender = msg.key.participant;
    const isAdmin = meta.participants.some(
      (p) => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
    );
    if (!isAdmin) {
      return sock.sendMessage(from, { text: 'Only admins can use .tagall' });
    }

    const mentions = meta.participants.map((p) => p.id);
    const header = args.length ? args.join(' ') : 'Attention everyone';
    const text = `*${header}*\n\n` + mentions.map((m) => `@${m.split('@')[0]}`).join('\n');
    await sock.sendMessage(from, { text, mentions });
  },
};
