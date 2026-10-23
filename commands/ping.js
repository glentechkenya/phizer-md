module.exports = {
  name: 'ping',
  description: 'Show bot response speed',
  async execute({ sock, from, msg }) {
    const start = Date.now();
    const sent = await sock.sendMessage(from, { text: 'Pinging...' });
    const latency = Date.now() - start;
    await sock.sendMessage(from, {
      text: `Pong! ${latency}ms`,
      edit: sent.key,
    });
  },
};
