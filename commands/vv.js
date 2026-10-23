module.exports = {
  name: 'vv',
  description: 'Retrieve supported view-once media when authorized',
  async execute({ sock, from, msg }) {
    const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) {
      return sock.sendMessage(from, {
        text: 'Reply to a view-once image or video with .vv',
      });
    }

    const media =
      quoted.viewOnceMessageV2?.message?.imageMessage ||
      quoted.viewOnceMessageV2?.message?.videoMessage ||
      quoted.viewOnceMessage?.message?.imageMessage ||
      quoted.viewOnceMessage?.message?.videoMessage;

    if (!media) {
      return sock.sendMessage(from, { text: 'No view-once media found.' });
    }

    try {
      const buffer = await sock.downloadMediaMessage(
        { message: quoted.viewOnceMessageV2 || quoted.viewOnceMessage },
        'buffer',
        {}
      );

      if (media.mimetype?.startsWith('image/')) {
        await sock.sendMessage(from, { image: buffer, caption: media.caption || '' });
      } else {
        await sock.sendMessage(from, { video: buffer, caption: media.caption || '' });
      }
    } catch (err) {
      console.error('[vv]', err);
      await sock.sendMessage(from, { text: 'Failed to retrieve media.' });
    }
  },
};
