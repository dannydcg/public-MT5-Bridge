import { ExchangeAdapter, NormalizedOrder } from './index';

export class BybitSpotAdapter implements ExchangeAdapter {
  constructor(private readonly apiKey?: string, private readonly apiSecret?: string) {}

  async getExchangeInfo(): Promise<any> {
    return { name: 'BYBIT', market: 'SPOT' };
  }

  async getBalances(userId: string): Promise<any> {
    return { balances: [] };
  }

  async getPositions(userId: string): Promise<any> {
    return { positions: [] };
  }

  async placeOrder(userId: string, order: NormalizedOrder): Promise<any> {
    return { ok: true, exchangeOrderId: `bybit_spot_${Date.now()}` };
  }

  async cancelOrder(userId: string, orderId: string): Promise<any> {
    return { ok: true };
  }

  async *streamMarketData(symbols: string[]): AsyncIterable<any> {
    while (true) {
      for (const s of symbols) {
        yield {
          exchange: 'BYBIT',
          market: 'SPOT',
          symbol: s,
          bid: (Math.random() * 10000 + 30000).toFixed(2),
          ask: (Math.random() * 10000 + 30010).toFixed(2),
          last: (Math.random() * 10000 + 30005).toFixed(2),
          volume: (Math.random() * 5).toFixed(6),
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
