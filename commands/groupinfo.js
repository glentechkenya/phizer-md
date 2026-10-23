module.exports = {
  name: 'groupinfo',
  description: 'Show group information',
  async execute({ sock, from }) {
    if (!from.endsWith('@g.us')) {
      return sock.sendMessage(from, { text: 'This command only works in groups.' });
    }
    const meta = await sock.groupMetadata(from);
    const text =
      `*Group Info*\n\n` +
      `Name: ${meta.subject}\n` +
      `Members: ${meta.participants.length}\n` +
      `Created: ${new Date(meta.creation * 1000).toDateString()}\n` +
      `Description: ${meta.desc || 'none'}`;
    await sock.sendMessage(from, { text });
  },
};
