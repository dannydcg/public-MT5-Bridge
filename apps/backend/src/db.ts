import { Pool } from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const DEV = process.env.DEV_MODE === 'true';
let pool: Pool | null = null;

if (!DEV) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/crypto_mt5_bridge'
  });
}

// In-memory stores for DEV mode
const devUsers: any[] = [];
const devTokens: any[] = [];
const devSessions: any[] = [];
const devOrders: any[] = [];
const devExecutions: any[] = [];
const devRiskSettings: any[] = [];

export const query = async (text: string, params?: unknown[]) => {
  // Use Postgres if available
  if (pool) {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params as any);
      return result;
    } finally {
      client.release();
    }
  }

  // DEV mode: lightweight in-memory emulation
  const sql = (text || '').toLowerCase();
  const p = params as any[] || [];

  // INSERT users
  if (sql.includes('insert into users')) {
    const [email, passwordHash] = p;
    // Check if user already exists
    const existing = devUsers.find(u => u.email === email);
    if (existing) {
      const err = new Error('User already exists') as any;
      err.code = '23505'; // Unique constraint violation
      throw err;
    }
    const rec = { id: crypto.randomUUID(), email, password_hash: passwordHash, created_at: new Date().toISOString() };
    devUsers.push(rec);
    return { rowCount: 1, rows: [rec] };
  }

  // SELECT users WHERE email AND password_hash
  if (sql.includes('select') && sql.includes('from users') && sql.includes('where email') && sql.includes('password_hash')) {
    const [email, passwordHash] = p;
    const found = devUsers.find(u => u.email === email && u.password_hash === passwordHash);
    return { rowCount: found ? 1 : 0, rows: found ? [found] : [] };
  }

  // INSERT mt5_terminal_tokens
  if (sql.includes('insert into mt5_terminal_tokens')) {
    const [userId, name, tokenHash] = p;
    const rec = { id: crypto.randomUUID(), user_id: userId, name, token_hash: tokenHash, status: 'active', created_at: new Date().toISOString() };
    devTokens.push(rec);
    return { rowCount: 1, rows: [rec] };
  }

  // SELECT from mt5_terminal_tokens WHERE token_hash
  if (sql.includes('from mt5_terminal_tokens') && sql.includes('where token_hash')) {
    const tokenHash = p[0] as string;
    const found = devTokens.find(t => t.token_hash === tokenHash);
    return { rowCount: found ? 1 : 0, rows: found ? [found] : [] };
  }

  // INSERT mt5_sessions
  if (sql.includes('insert into mt5_sessions')) {
    const [userId, tokenId, connectionId, clientIp, mt5AccountLogin, mt5TerminalBuild] = p;
    const rec = { id: crypto.randomUUID(), user_id: userId, terminal_token_id: tokenId, connection_id: connectionId, client_ip: clientIp, mt5_account_login: mt5AccountLogin, mt5_terminal_build: mt5TerminalBuild, status: 'connected', connected_at: new Date().toISOString() };
    devSessions.push(rec);
    return { rowCount: 1, rows: [{ id: rec.id, status: rec.status, connected_at: rec.connected_at }] };
  }

  // SELECT from orders
  if (sql.includes('select') && sql.includes('from orders') && sql.includes('where')) {
    const [userId, exchange] = p;
    const rows = devOrders.filter(o => o.user_id === userId && o.exchange === exchange);
    return { rowCount: rows.length, rows };
  }

  // INSERT orders
  if (sql.includes('insert into orders')) {
    const [userId, exchangeAccountId, mt5ClientOrderId, mt5Symbol, exchange, marketType, exchangeSymbol, side, orderType, quantity, price, status] = p;
    const rec = { id: crypto.randomUUID(), user_id: userId, exchange_account_id: exchangeAccountId, mt5_client_order_id: mt5ClientOrderId, mt5_symbol: mt5Symbol, exchange, market_type: marketType, exchange_symbol: exchangeSymbol, side, order_type: orderType, quantity, price, status, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    devOrders.push(rec);
    return { rowCount: 1, rows: [{ id: rec.id, status: rec.status, created_at: rec.created_at }] };
  }

  // SELECT accepted demo orders
  if (sql.includes("where status = 'accepted'") && sql.includes("exchange =")) {
    const rows = devOrders.filter(o => o.status === 'accepted' && o.exchange === 'DEMO').slice(0, 5);
    return { rowCount: rows.length, rows };
  }

  // UPDATE orders SET status
  if (sql.includes('update orders set status')) {
    const [status, id] = p;
    const o = devOrders.find(x => x.id === id);
    if (o) { o.status = status; o.updated_at = new Date().toISOString(); }
    return { rowCount: 0, rows: [] };
  }

  // INSERT executions
  if (sql.includes('insert into executions')) {
    const [orderId, exchangeExecutionId, executedQuantity, executedPrice] = p;
    const rec = { id: crypto.randomUUID(), order_id: orderId, exchange_execution_id: exchangeExecutionId, executed_quantity: executedQuantity, executed_price: executedPrice, executed_at: new Date().toISOString() };
    devExecutions.push(rec);
    return { rowCount: 1, rows: [rec] };
  }

  // SELECT from executions (joined query)
  if (sql.includes('select e.id') && sql.includes('join orders')) {
    const [userId, exchange] = p;
    const orderIds = devOrders.filter(o => o.user_id === userId && o.exchange === exchange).map(o => o.id);
    const rows = devExecutions.filter(e => orderIds.includes(e.order_id)).slice(0, 200);
    return { rowCount: rows.length, rows };
  }

  // SELECT from risk_settings
  if (sql.includes('from risk_settings') && sql.includes('where')) {
    const [userId] = p;
    const found = devRiskSettings.find(r => r.user_id === userId);
    return { rowCount: found ? 1 : 0, rows: found ? [found] : [] };
  }

  // INSERT audit_logs
  if (sql.includes('insert into audit_logs')) {
    const [userId, action, entityType, entityId, metadata, ip] = p;
    const rec = { id: crypto.randomUUID(), user_id: userId, action, entity_type: entityType, entity_id: entityId, metadata: metadata ? JSON.parse(metadata) : {}, ip_address: ip, created_at: new Date().toISOString() };
    return { rowCount: 1, rows: [rec] };
  }

  // Default: return empty result
  return { rowCount: 0, rows: [] };
};

export const initDatabase = async () => {
  if (!DEV && pool) {
    await query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS mt5_terminal_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        token_hash TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        last_seen_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        revoked_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS mt5_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        terminal_token_id UUID NOT NULL REFERENCES mt5_terminal_tokens(id),
        connection_id TEXT NOT NULL,
        client_ip INET,
        mt5_account_login TEXT,
        mt5_terminal_build TEXT,
        status TEXT NOT NULL DEFAULT 'connected',
        connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        disconnected_at TIMESTAMPTZ
      );
    `);
  }
  // In DEV mode, no-op
};

export const lookupMt5Token = async (token: string) => {
  if (!DEV && pool) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const result = await query(
      'SELECT id, user_id, status FROM mt5_terminal_tokens WHERE token_hash = $1',
      [tokenHash]
    );
    return result.rowCount === 1 ? result.rows[0] : null;
  }

  // DEV mode: check in-memory or create demo token for 'test'
  if (token === 'test') {
    let t = devTokens.find(x => x.name === 'dev-test');
    if (!t) {
      t = { id: crypto.randomUUID(), user_id: 'dev-user', name: 'dev-test', token_hash: crypto.createHash('sha256').update('test').digest('hex'), status: 'active' };
      devTokens.push(t);
    }
    return { id: t.id, user_id: t.user_id, status: t.status };
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const found = devTokens.find(t => t.token_hash === tokenHash && t.status === 'active');
  return found ? { id: found.id, user_id: found.user_id, status: found.status } : null;
};

export const createMt5Session = async (userId: string, tokenId: string, connectionId: string, clientIp?: string, mt5AccountLogin?: string, mt5TerminalBuild?: string) => {
  if (!DEV && pool) {
    const result = await query(
      `INSERT INTO mt5_sessions (user_id, terminal_token_id, connection_id, client_ip, mt5_account_login, mt5_terminal_build)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, status, connected_at`,
      [userId, tokenId, connectionId, clientIp, mt5AccountLogin, mt5TerminalBuild]
    );
    return result.rows[0];
  }

  const rec = { id: crypto.randomUUID(), user_id: userId, terminal_token_id: tokenId, connection_id: connectionId, client_ip: clientIp, mt5_account_login: mt5AccountLogin, mt5_terminal_build: mt5TerminalBuild, status: 'connected', connected_at: new Date().toISOString() };
  devSessions.push(rec);
  return { id: rec.id, status: rec.status, connected_at: rec.connected_at };
};
