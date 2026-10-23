const express = require('express');
const http = require('http');
const path = require('path');
const QRCode = require('qrcode');
const { WebSocketServer } = require('ws');

function startWebServer(state, helpers) {
  const app = express();
  const server = http.createServer(app);

  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/api/status', (req, res) => {
    res.json({ status: state.status, phoneNumber: state.phoneNumber });
  });

  app.get('/api/qr', async (req, res) => {
    if (!state.qr) return res.json({ qr: null });
    const dataUrl = await QRCode.toDataURL(state.qr, { width: 320, margin: 2 });
    res.json({ qr: dataUrl });
  });

  const wss = new WebSocketServer({ server, path: '/ws' });

  function broadcast(payload) {
    const msg = JSON.stringify(payload);
    for (const client of wss.clients) {
      if (client.readyState === 1) client.send(msg);
    }
  }

  // Poll state and push updates to clients
  let lastStatus = null;
  let lastQr = null;
  setInterval(async () => {
    if (state.status !== lastStatus) {
      lastStatus = state.status;
      broadcast({ type: 'status', status: state.status, phoneNumber: state.phoneNumber });
    }
    if (state.qr && state.qr !== lastQr) {
      lastQr = state.qr;
      const dataUrl = await QRCode.toDataURL(state.qr, { width: 320, margin: 2 });
      broadcast({ type: 'qr', qr: dataUrl });
    }
    if (!state.qr && lastQr) {
      lastQr = null;
      broadcast({ type: 'qr', qr: null });
    }
  }, 1000);

  wss.on('connection', async (ws) => {
    ws.send(JSON.stringify({ type: 'status', status: state.status, phoneNumber: state.phoneNumber }));
    if (state.qr) {
      const dataUrl = await QRCode.toDataURL(state.qr, { width: 320, margin: 2 });
      ws.send(JSON.stringify({ type: 'qr', qr: dataUrl }));
    }
  });

  const port = require('../config').port;
  server.listen(port, () => {
    console.log(`[PHIZER MD] Pairing website running at http://localhost:${port}`);
  });

  return { app, server, broadcast };
}

module.exports = { startWebServer };
