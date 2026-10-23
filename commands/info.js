module.exports = {
  name: 'info',
  description: 'Display bot information',
  async execute({ sock, from, config }) {
    const text =
      `*${config.botName} Info*\n\n` +
      `Library: Baileys 6.7.24\n` +
      `Prefix: ${config.prefix}\n` +
      `Developer: ${config.ownerName}`;
    await sock.sendMessage(from, { text });
  },
};
