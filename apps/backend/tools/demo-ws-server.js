import { WebSocketServer } from 'ws';

const port = process.env.PORT || 8081;
const wss = new WebSocketServer({ port });

console.log(`Demo WS server listening on ws://localhost:${port}`);

function buildSymbolMetadata(symbol) {
  return { symbol, base: symbol.replace(/USDT$/i, ''), quote: 'USDT', pricePrecision: 2 };
}

function randomTick(symbol) {
  const bid = (Math.random() * 10000 + 20000).toFixed(2);
  const ask = (Number(bid) + Math.random() * 20).toFixed(2);
  const last = ((Number(bid) + Number(ask)) / 2).toFixed(2);
  const volume = (Math.random() * 100).toFixed(6);
  return { exchange: 'DEMO', market: 'SPOT', symbol, bid, ask, last, volume, exchange_time: new Date().toISOString() };
}

wss.on('connection', (socket, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const symbolsParam = url.searchParams.get('symbols') ?? '';
  const symbols = symbolsParam ? symbolsParam.split(',').map(s => s.trim().toUpperCase()) : ['BTCUSDT'];

  // send metadata
  for (const s of symbols) {
    socket.send(JSON.stringify({ type: 'symbol_metadata', payload: buildSymbolMetadata(s) }));
  }

  const iv = setInterval(() => {
    for (const s of symbols) {
      if (socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify({ type: 'tick', payload: randomTick(s) }));
      }
    }
  }, 200);

  socket.on('close', () => clearInterval(iv));
});

process.on('SIGINT', () => process.exit());
