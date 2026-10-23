const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const { startWebServer } = require('./web/server');

const logger = pino({ level: 'silent' });

// Shared connection state exposed to the web server
const state = {
  status: 'disconnected', // disconnected | connecting | qr | connected
  qr: null,
  phoneNumber: null,
};

let sock = null;
let startTime = Date.now();
let reconnectTimer = null;

function loadCommands() {
  const commands = new Map();
  const dir = path.join(__dirname, 'commands');
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.js')) continue;
    const cmd = require(path.join(dir, file));
    if (cmd && cmd.name) commands.set(cmd.name, cmd);
  }
  return commands;
}

const commands = loadCommands();

async function connectToWhatsApp() {
  const { state: authState, saveCreds } = await useMultiFileAuthState(config.sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  state.status = 'connecting';
  state.qr = null;

  sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: {
      creds: authState.creds,
      keys: makeCacheableSignalKeyStore(authState.keys, logger),
    },
    browser: ['PHIZER MD', 'Chrome', '1.0.0'],
    generateHighQualityLinkPreview: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      state.qr = qr;
      state.status = 'qr';
      console.log('[PHIZER MD] New QR generated — open the website to scan.');
    }

    if (connection === 'open') {
      state.status = 'connected';
      state.qr = null;
      startTime = Date.now();
      state.phoneNumber = sock.user?.id?.split(':')[0] || null;
      console.log(`[PHIZER MD] Connected as ${state.phoneNumber}`);
    }

    if (connection === 'close') {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      state.status = 'disconnected';
      state.qr = null;

      if (code === DisconnectReason.loggedOut) {
        console.log('[PHIZER MD] Logged out. Delete auth_info and restart to re-pair.');
        return;
      }

      console.log(`[PHIZER MD] Disconnected (code ${code}). Reconnecting in 3s...`);
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connectToWhatsApp, 3000);
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0];
      if (!msg.message || msg.key.fromMe) return;

      const from = msg.key.remoteJid;
      const type = Object.keys(msg.message)[0];
      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        (type === 'imageMessage' ? msg.message.imageMessage.caption : '') ||
        '';

      if (!text.startsWith(config.prefix)) return;

      const body = text.slice(config.prefix.length).trim();
      const [commandName, ...args] = body.split(/\s+/);
      const command = commands.get(commandName.toLowerCase());
      if (!command) return;

      await command.execute({
        sock,
        msg,
        from,
        args,
        text,
        commands,
        state,
        startTime,
        config,
      });
    } catch (err) {
      console.error('[PHIZER MD] Command error:', err);
    }
  });
}

startWebServer(state, {
  getCommands: () => commands,
  getStartTime: () => startTime,
});

connectToWhatsApp();
