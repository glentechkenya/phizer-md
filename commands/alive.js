module.exports = {
  name: 'alive',
  description: 'Check whether the bot is online',
  async execute({ sock, from, config }) {
    await sock.sendMessage(from, {
      text: `${config.botName} is alive and responding.`,
    });
  },
};
