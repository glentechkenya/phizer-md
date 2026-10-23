module.exports = {
  name: 'owner',
  description: 'Display owner information',
  async execute({ sock, from, config }) {
    const text =
      `*Owner*\n\n` +
      `Name: ${config.ownerName}\n` +
      `Number: ${config.ownerNumber || 'not configured'}\n` +
      `Repo: https://github.com/glentechkenya/phizer-md`;
    await sock.sendMessage(from, { text });
  },
};
