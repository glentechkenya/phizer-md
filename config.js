require('dotenv').config();

module.exports = {
  botName: process.env.BOT_NAME || 'PHIZER MD',
  prefix: process.env.PREFIX || '.',
  ownerName: process.env.OWNER_NAME || 'glentechkenya',
  ownerNumber: process.env.OWNER_NUMBER || '',
  port: parseInt(process.env.PORT || '3000', 10),
  pairingPassword: process.env.PAIRING_PASSWORD || '',
  sessionDir: 'auth_info',
};
