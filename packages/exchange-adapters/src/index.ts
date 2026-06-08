export interface NormalizedOrder {
  symbol: string;
  side: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT';
  quantity: string;
  price?: string;
  reduceOnly?: boolean;
}

export interface ExchangeAdapter {
  getExchangeInfo(): Promise<any>;
  getBalances(userId: string): Promise<any>;
  getPositions(userId: string): Promise<any>;
  placeOrder(userId: string, order: NormalizedOrder): Promise<any>;
  cancelOrder(userId: string, orderId: string): Promise<any>;
  streamMarketData(symbols: string[]): AsyncIterable<any>;
  streamUserEvents(userId: string): AsyncIterable<any>;
}

export { BinanceSpotAdapter } from './binanceSpotAdapter';
export { BinancePerpAdapter } from './binancePerpAdapter';
export { BybitSpotAdapter } from './bybitSpotAdapter';
export { BybitPerpAdapter } from './bybitPerpAdapter';
