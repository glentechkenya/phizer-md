module.exports = {
  name: 'help',
  description: 'Display help information',
  async execute({ sock, from, config }) {
    const text =
      `*${config.botName} Help*\n\n` +
      `Use commands with the "${config.prefix}" prefix.\n` +
      `Example: ${config.prefix}ping\n\n` +
      `Type ${config.prefix}menu to see all commands.`;
    await sock.sendMessage(from, { text });
  },
};
