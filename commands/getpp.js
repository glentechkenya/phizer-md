module.exports = {
  name: 'getpp',
  description: "Retrieve a user's profile picture when accessible",
  async execute({ sock, from, msg, args }) {
    const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const target = mentioned || (args[0] ? `${args[0].replace(/\D/g, '')}@s.whatsapp.net` : from);

    try {
      const url = await sock.profilePictureUrl(target, 'image');
      const res = await fetch(url);
      const buffer = Buffer.from(await res.arrayBuffer());
      await sock.sendMessage(from, { image: buffer, caption: 'Profile picture' });
    } catch (err) {
      await sock.sendMessage(from, {
        text: 'Could not fetch profile picture (may be private).',
      });
    }
  },
};
