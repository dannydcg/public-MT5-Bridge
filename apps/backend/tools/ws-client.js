import WebSocket from 'ws';

const url = process.argv[2] || 'ws://localhost:8081/?token=test&symbols=BTCUSDT,ETHUSDT';
console.log('Connecting to', url);

const ws = new WebSocket(url);
ws.on('open', () => console.log('open'));
ws.on('message', (data) => {
  try {
    const msg = JSON.parse(data.toString());
    console.log('recv', msg.type, msg.payload && (msg.payload.symbol || 'payload'));
  } catch (err) {
    console.log('recv raw', data.toString());
  }
});
ws.on('close', () => console.log('closed'));
ws.on('error', (err) => console.error('error', err.message));

setTimeout(() => { console.log('closing client'); ws.close(); }, 5000);
