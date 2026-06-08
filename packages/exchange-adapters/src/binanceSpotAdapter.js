export class BinanceSpotAdapter {
    constructor(apiKey, apiSecret) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }
    async getExchangeInfo() {
        return { name: 'BINANCE', market: 'SPOT' };
    }
    async getBalances(userId) {
        return { balances: [] };
    }
    async getPositions(userId) {
        return { positions: [] };
    }
    async placeOrder(userId, order) {
        return { ok: true, exchangeOrderId: `binance_spot_${Date.now()}` };
    }
    async cancelOrder(userId, orderId) {
        return { ok: true };
    }
    async *streamMarketData(symbols) {
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
    async *streamUserEvents(userId) {
        // No-op mock
        return;
    }
}
