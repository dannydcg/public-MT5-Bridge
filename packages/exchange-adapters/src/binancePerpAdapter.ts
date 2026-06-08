import { ExchangeAdapter, NormalizedOrder } from './index';

export class BinancePerpAdapter implements ExchangeAdapter {
  constructor(private readonly apiKey?: string, private readonly apiSecret?: string) {}

  async getExchangeInfo(): Promise<any> {
    return { name: 'BINANCE', market: 'PERP' };
  }

  async getBalances(userId: string): Promise<any> {
    return { balances: [] };
  }

  async getPositions(userId: string): Promise<any> {
    return { positions: [] };
  }

  async placeOrder(userId: string, order: NormalizedOrder): Promise<any> {
    return { ok: true, exchangeOrderId: `binance_perp_${Date.now()}` };
  }

  async cancelOrder(userId: string, orderId: string): Promise<any> {
    return { ok: true };
  }

  async *streamMarketData(symbols: string[]): AsyncIterable<any> {
    while (true) {
      for (const s of symbols) {
        yield {
          exchange: 'BINANCE',
          market: 'PERP',
          symbol: s,
          bid: (Math.random() * 10000 + 20000).toFixed(2),
          ask: (Math.random() * 10000 + 20010).toFixed(2),
          last: (Math.random() * 10000 + 20005).toFixed(2),
          volume: (Math.random() * 50).toFixed(6),
          exchange_time: new Date().toISOString(),
        };
      }
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  async *streamUserEvents(userId: string): AsyncIterable<any> {
    return;
  }
}
