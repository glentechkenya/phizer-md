module.exports = {
  name: 'runtime',
  description: 'Show how long the bot has been running',
  async execute({ sock, from, startTime }) {
    const ms = Date.now() - startTime;
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000) % 60;
    const h = Math.floor(ms / 3600000);
    await sock.sendMessage(from, {
      text: `Runtime: ${h}h ${m}m ${s}s`,
    });
  },
};
