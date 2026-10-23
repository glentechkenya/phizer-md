const sharp = require('sharp');

module.exports = {
  name: 'sticker',
  description: 'Convert a replied image or video into a sticker',
  async execute({ sock, from, msg }) {
    const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) {
      return sock.sendMessage(from, {
        text: 'Reply to an image or short video with .sticker',
      });
    }

    const imageMsg = quoted.imageMessage;
    const videoMsg = quoted.videoMessage;
    if (!imageMsg && !videoMsg) {
      return sock.sendMessage(from, { text: 'Only images or short videos are supported.' });
    }

    try {
      const stream = await sock.downloadMediaMessage({
        message: quoted,
        key: msg.message.extendedTextMessage.contextInfo.stanzaId,
      }, 'buffer', {});

      const webp = await sharp(stream)
        .resize(512, 512, { fit: 'inside' })
        .webp()
        .toBuffer();

      await sock.sendMessage(from, { sticker: webp });
    } catch (err) {
      console.error('[sticker]', err);
      await sock.sendMessage(from, { text: 'Failed to create sticker.' });
    }
  },
};
