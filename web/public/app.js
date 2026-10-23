const statusEl = document.getElementById('status');
const qrImage = document.getElementById('qrImage');
const placeholder = document.getElementById('placeholder');

function setStatus(status) {
  const labels = {
    disconnected: 'Disconnected',
    connecting: 'Connecting',
    qr: 'Waiting for scan',
    connected: 'Connected',
  };
  statusEl.textContent = labels[status] || status;
  statusEl.className = `status ${status}`;
}

function setQr(dataUrl) {
  if (dataUrl) {
    qrImage.src = dataUrl;
    qrImage.hidden = false;
    placeholder.hidden = true;
  } else {
    qrImage.hidden = true;
    placeholder.hidden = false;
    placeholder.textContent =
      statusEl.textContent === 'Connected' ? 'Already connected.' : 'Waiting for connection...';
  }
}

function connect() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  const ws = new WebSocket(`${proto}://${location.host}/ws`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'status') setStatus(data.status);
    if (data.type === 'qr') setQr(data.qr);
  };

  ws.onclose = () => setTimeout(connect, 3000);
}

document.getElementById('refreshBtn').addEventListener('click', async () => {
  const res = await fetch('/api/qr');
  const data = await res.json();
  setQr(data.qr);
});

connect();
