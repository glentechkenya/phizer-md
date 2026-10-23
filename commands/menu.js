module.exports = {
  name: 'menu',
  description: 'Show all available commands',
  async execute({ sock, from, commands, config }) {
    const lines = [...commands.values()]
      .map((c) => `• ${config.prefix}${c.name} — ${c.description}`)
      .join('\n');
    const text = `*${config.botName} — Menu*\n\n${lines}`;
    await sock.sendMessage(from, { text });
  },
};
