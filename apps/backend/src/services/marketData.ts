type Tick = {
  exchange: string;
  market: string;
  symbol: string;
  bid: string;
  ask: string;
  last: string;
  volume: string;
  exchange_time: string;
};

export const subscribeToMarketData = async function* (symbols: string[] = []): AsyncGenerator<Tick> {
  const sourceSymbols = symbols.length > 0 ? symbols : ['BTCUSDT', 'ETHUSDT'];
  while (true) {
    for (const s of sourceSymbols) {
      const bid = (Math.random() * 10000 + 20000).toFixed(2);
      const ask = (Number(bid) + Math.random() * 20).toFixed(2);
      const last = ((Number(bid) + Number(ask)) / 2).toFixed(2);
      const volume = (Math.random() * 100).toFixed(6);
      yield {
        exchange: 'DEMO',
        market: 'SPOT',
        symbol: s,
        bid,
        ask,
        last,
        volume,
        exchange_time: new Date().toISOString(),
      };
    }
    await new Promise((r) => setTimeout(r, 150));
  }
};

export const buildSymbolMetadata = (symbol: string) => ({
  symbol,
  base: symbol.replace(/USDT$/i, ''),
  quote: 'USDT',
  pricePrecision: 2,
  lotSize: '0.0001',
});

export type { Tick };
