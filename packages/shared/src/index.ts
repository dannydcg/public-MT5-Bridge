export interface SymbolMetadata {
  mt5Symbol: string;
  exchange: 'BINANCE' | 'BYBIT';
  marketType: 'SPOT' | 'PERP';
  exchangeSymbol: string;
  baseAsset: string;
  quoteAsset: string;
  priceTick: string;
  qtyStep: string;
  minQty: string;
  minNotional: string;
}

export interface Mt5OrderRequest {
  requestId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT';
  quantity: string;
  price?: string;
  reduceOnly?: boolean;
}
