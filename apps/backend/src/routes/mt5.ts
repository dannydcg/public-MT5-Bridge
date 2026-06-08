import { FastifyInstance } from 'fastify';
import { createMt5Session, lookupMt5Token, query } from '../db.js';
import crypto from 'crypto';

// Simple risk check helper
async function checkRisk(userId: string, mt5Symbol: string, notional: number) {
  const res = await query('SELECT max_order_notional, trading_enabled FROM risk_settings WHERE user_id = $1 LIMIT 1', [userId]);
  if (res.rowCount === 0) return { ok: true };
  const row = res.rows[0];
  if (!row.trading_enabled) return { ok: false, reason: 'trading_disabled' };
  if (row.max_order_notional && Number(row.max_order_notional) < notional) return { ok: false, reason: 'exceeds_max_order_notional' };
  return { ok: true };
}

export async function mt5Routes(app: FastifyInstance) {
  app.post('/api/mt5/tokens', async (request, reply) => {
    const user = request.user as { userId: string } | undefined;
    if (!user?.userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const token = `mt5_${crypto.randomBytes(24).toString('hex')}`;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const name = (request.body as { name?: string }).name ?? 'MT5 Terminal';

    await query(
      'INSERT INTO mt5_terminal_tokens (user_id, name, token_hash) VALUES ($1, $2, $3)',
      [user.userId, name, tokenHash]
    );

    return reply.status(201).send({ token, name });
  });

  app.post('/api/mt5/verify', async (request, reply) => {
    const { token } = request.body as { token?: string };
    if (!token) {
      return reply.status(400).send({ error: 'Token is required' });
    }

    const terminalToken = await lookupMt5Token(token);
    if (!terminalToken || terminalToken.status !== 'active') {
      return reply.status(401).send({ error: 'Invalid or revoked token' });
    }

    return reply.send({ valid: true, tokenId: terminalToken.id });
  });

  app.get('/api/mt5/sessions', async (request, reply) => {
    const user = request.user as { userId: string } | undefined;
    if (!user?.userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const result = await query('SELECT id, status, connected_at, disconnected_at, mt5_terminal_build FROM mt5_sessions WHERE user_id = $1 ORDER BY connected_at DESC LIMIT 20', [user.userId]);
    return reply.send({ sessions: result.rows });
  });

  app.post('/api/mt5/sessions', async (request, reply) => {
    const { token, connectionId, clientIp, mt5AccountLogin, mt5TerminalBuild } = request.body as {
      token?: string;
      connectionId?: string;
      clientIp?: string;
      mt5AccountLogin?: string;
      mt5TerminalBuild?: string;
    };

    if (!token || !connectionId) {
      return reply.status(400).send({ error: 'token and connectionId are required' });
    }

    const terminalToken = await lookupMt5Token(token);
    if (!terminalToken || terminalToken.status !== 'active') {
      return reply.status(401).send({ error: 'Invalid or revoked token' });
    }

    const session = await createMt5Session(
      terminalToken.user_id,
      terminalToken.id,
      connectionId,
      clientIp,
      mt5AccountLogin,
      mt5TerminalBuild
    );

    return reply.status(201).send({ session });
  });

  // Place order from MT5 EA (basic router + risk check + insert order record)
  app.post('/api/mt5/place_order', async (request, reply) => {
    const { token, order } = request.body as { token?: string; order?: any };
    if (!token || !order) return reply.status(400).send({ error: 'token and order required' });

    const terminalToken = await lookupMt5Token(token);
    if (!terminalToken || terminalToken.status !== 'active') return reply.status(401).send({ error: 'invalid_token' });

    const userId = terminalToken.user_id;

    // validate basic order payload
    const o: any = order;
    if (!o.symbol || !o.side || !o.orderType || !o.quantity) return reply.status(400).send({ error: 'invalid_order' });

    // compute notional approximate using last price (best effort)
    const lastRes = await query('SELECT last FROM (VALUES (1)) as x(last)');
    const notional = Number(o.quantity) * (o.price ? Number(o.price) : 1);

    const risk = await checkRisk(userId, o.symbol, notional);
    if (!risk.ok) return reply.status(403).send({ error: 'risk_reject', reason: risk.reason });

    // create a placeholder order record
    const mt5ClientOrderId = o.mt5ClientOrderId ?? `ea_${Date.now()}`;
    const insert = await query(
      `INSERT INTO orders (user_id, exchange_account_id, mt5_client_order_id, mt5_symbol, exchange, market_type, exchange_symbol, side, order_type, quantity, price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, status, created_at`,
      [userId, null, mt5ClientOrderId, o.mt5Symbol ?? o.symbol, 'DEMO', 'SPOT', o.symbol, o.side, o.orderType, o.quantity, o.price ?? null, 'accepted']
    );

    const created = insert.rows[0];

    // create audit log
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, 'place_order', 'order', created.id, JSON.stringify({ order: o }), request.ip]
    );

    // if demo flag present, optionally create a simulated execution
    if ((request.body as any).demo || (request.query as any).demo === 'true') {
      await query(
        `INSERT INTO executions (order_id, exchange_execution_id, executed_quantity, executed_price, fee_asset, fee_amount, executed_at)
         VALUES ($1, $2, $3, $4, $5, $6, now())`,
        [created.id, `demo_exec_${Date.now()}`, o.quantity, o.price ?? 0, null, null]
      );
    }

    // For demo mode we don't send to exchange; return accepted
    return reply.status(201).send({ ok: true, order: { id: created.id, status: created.status, mt5ClientOrderId } });
  });

  // Demo GET variant so MT5 WebRequest can easily place demo orders
  app.get('/api/mt5/place_order', async (request, reply) => {
    const token = (request.query as any).token ?? '';
    if (!token) return reply.status(400).send({ error: 'token required' });

    const terminalToken = await lookupMt5Token(token);
    if (!terminalToken || terminalToken.status !== 'active') return reply.status(401).send({ error: 'invalid_token' });

    const userId = terminalToken.user_id;
    const q = request.query as any;
    const o = {
      symbol: q.symbol,
      side: q.side,
      orderType: q.orderType,
      quantity: q.quantity,
      price: q.price
    };

    if (!o.symbol || !o.side || !o.orderType || !o.quantity) return reply.status(400).send({ error: 'invalid_order' });

    const notional = Number(o.quantity) * (o.price ? Number(o.price) : 1);
    const risk = await checkRisk(userId, o.symbol, notional);
    if (!risk.ok) return reply.status(403).send({ error: 'risk_reject', reason: risk.reason });

    const mt5ClientOrderId = q.mt5ClientOrderId ?? `ea_${Date.now()}`;
    const insert = await query(
      `INSERT INTO orders (user_id, exchange_account_id, mt5_client_order_id, mt5_symbol, exchange, market_type, exchange_symbol, side, order_type, quantity, price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, status, created_at`,
      [userId, null, mt5ClientOrderId, o.symbol, 'DEMO', 'SPOT', o.symbol, o.side, o.orderType, o.quantity, o.price ?? null, 'accepted']
    );

    const created = insert.rows[0];

    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, 'place_order', 'order', created.id, JSON.stringify({ order: o }), request.ip]
    );

    if ((request.query as any).demo === 'true') {
      await query(
        `INSERT INTO executions (order_id, exchange_execution_id, executed_quantity, executed_price, fee_asset, fee_amount, executed_at)
         VALUES ($1, $2, $3, $4, $5, $6, now())`,
        [created.id, `demo_exec_${Date.now()}`, o.quantity, o.price ?? 0, null, null]
      );
    }

    return reply.status(201).send({ ok: true, order: { id: created.id, status: created.status, mt5ClientOrderId } });
  });
}
