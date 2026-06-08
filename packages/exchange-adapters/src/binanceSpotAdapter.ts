import { ExchangeAdapter, NormalizedOrder } from './index';

export class BinanceSpotAdapter implements ExchangeAdapter {
  constructor(private readonly apiKey?: string, private readonly apiSecret?: string) {}

  async getExchangeInfo(): Promise<any> {
    return { name: 'BINANCE', market: 'SPOT' };
  }

  async getBalances(userId: string): Promise<any> {
    return { balances: [] };
  }

  async getPositions(userId: string): Promise<any> {
    return { positions: [] };
  }

  async placeOrder(userId: string, order: NormalizedOrder): Promise<any> {
    return { ok: true, exchangeOrderId: `binance_spot_${Date.now()}` };
  }

  async cancelOrder(userId: string, orderId: string): Promise<any> {
    return { ok: true };
  }

  async *streamMarketData(symbols: string[]): AsyncIterable<any> {
    // Simple mocked tick stream for development/demo
    while (true) {
      for (const s of symbols) {
        yield {
          exchange: 'BINANCE',
          market: 'SPOT',
          symbol: s,
          bid: (Math.random() * 10000 + 10000).toFixed(2),
          ask: (Math.random() * 10000 + 10010).toFixed(2),
          last: (Math.random() * 10000 + 10005).toFixed(2),
          volume: (Math.random() * 10).toFixed(6),
          exchange_time: new Date().toISOString(),
        };
      }
      // Wait ~200ms between batches
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  async *streamUserEvents(userId: string): AsyncIterable<any> {
    // No-op mock
    return;
  }
}
