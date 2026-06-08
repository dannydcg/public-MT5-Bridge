import { FastifyInstance } from 'fastify';
import { lookupMt5Token, createMt5Session } from '../db.js';
import { subscribeToMarketData, buildSymbolMetadata } from '../services/marketData.js';

export const wsRoutes = async (app: FastifyInstance) => {
  app.get('/mt5/ws', { websocket: true }, async (connection: any, req: any) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get('token') ?? '';
      const symbolsParam = url.searchParams.get('symbols') ?? '';
      const symbols = symbolsParam ? symbolsParam.split(',').map((s) => s.trim().toUpperCase()) : [];

      const tokenRow = await lookupMt5Token(token);
      if (!tokenRow || tokenRow.status !== 'active') {
        connection.socket.send(JSON.stringify({ type: 'error', message: 'invalid_token' }));
        connection.socket.close();
        return;
      }

      await createMt5Session(tokenRow.user_id, tokenRow.id, `ws-${Date.now()}`, req.socket.remoteAddress ?? undefined);

      // send symbol metadata
      for (const s of symbols) {
        connection.socket.send(JSON.stringify({ type: 'symbol_metadata', payload: buildSymbolMetadata(s) }));
      }

      const stream = subscribeToMarketData(symbols);
      for await (const tick of stream) {
        if (connection.socket.readyState !== 1) break;
        connection.socket.send(JSON.stringify({ type: 'tick', payload: tick }));
      }
    } catch (err) {
      try { connection.socket.send(JSON.stringify({ type: 'error', message: 'server_error' })); } catch {}
      connection.socket.close();
    }
  });
};
