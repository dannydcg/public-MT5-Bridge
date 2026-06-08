import { FastifyInstance } from 'fastify';
import { lookupMt5Token, createMt5Session } from '../db.js';
import { buildSymbolMetadata } from '../services/marketData.js';

function randomTickFor(symbol: string, exchange = 'DEMO', market = 'SPOT') {
  const bid = (Math.random() * 10000 + 20000).toFixed(2);
  const ask = (Number(bid) + Math.random() * 20).toFixed(2);
  const last = ((Number(bid) + Number(ask)) / 2).toFixed(2);
  const volume = (Math.random() * 100).toFixed(6);
  return { exchange, market, symbol, bid, ask, last, volume, exchange_time: new Date().toISOString() };
}

export const pollRoutes = async (app: FastifyInstance) => {
  app.get('/mt5/poll', async (request, reply) => {
    const token = (request.query as any).token ?? '';
    const symbolsParam = (request.query as any).symbols ?? '';
    const symbols = symbolsParam ? (symbolsParam as string).split(',').map(s => s.trim().toUpperCase()) : ['BTCUSDT'];

    const tokenRow = await lookupMt5Token(token);
    if (!tokenRow || tokenRow.status !== 'active') {
      return reply.code(401).send({ error: 'invalid_token' });
    }

    await createMt5Session(tokenRow.user_id, tokenRow.id, `poll-${Date.now()}`, request.ip as string);

    // Build newline-delimited JSON messages (type + payload) so EA can parse lines
    const parts: string[] = [];
    for (const s of symbols) {
      parts.push(JSON.stringify({ type: 'symbol_metadata', payload: buildSymbolMetadata(s) }));
    }
    for (const s of symbols) {
      parts.push(JSON.stringify({ type: 'tick', payload: randomTickFor(s) }));
    }

    reply.header('Content-Type', 'application/json; charset=utf-8');
    return parts.join('\n');
  });
};
