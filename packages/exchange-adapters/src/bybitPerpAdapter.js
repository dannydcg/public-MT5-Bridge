export class BybitPerpAdapter {
    constructor(apiKey, apiSecret) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }
    async getExchangeInfo() {
        return { name: 'BYBIT', market: 'PERP' };
    }
    async getBalances(userId) {
        return { balances: [] };
    }
    async getPositions(userId) {
        return { positions: [] };
    }
    async placeOrder(userId, order) {
        return { ok: true, exchangeOrderId: `bybit_perp_${Date.now()}` };
    }
    async cancelOrder(userId, orderId) {
        return { ok: true };
    }
    async *streamMarketData(symbols) {
        while (true) {
            for (const s of symbols) {
                yield {
                    exchange: 'BYBIT',
                    market: 'PERP',
                    symbol: s,
                    bid: (Math.random() * 10000 + 40000).toFixed(2),
                    ask: (Math.random() * 10000 + 40010).toFixed(2),
                    last: (Math.random() * 10000 + 40005).toFixed(2),
                    volume: (Math.random() * 100).toFixed(6),
                    exchange_time: new Date().toISOString(),
                };
            }
            await new Promise((r) => setTimeout(r, 200));
        }
    }
    async *streamUserEvents(userId) {
        return;
    }
}
