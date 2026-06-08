-- Initial PostgreSQL schema for Crypto MT5 Bridge

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exchange_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  exchange TEXT NOT NULL CHECK (exchange IN ('BINANCE', 'BYBIT')),
  label TEXT NOT NULL,
  api_key_encrypted BYTEA NOT NULL,
  api_secret_encrypted BYTEA NOT NULL,
  passphrase_encrypted BYTEA,
  permissions JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS symbols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mt5_symbol TEXT UNIQUE NOT NULL,
  exchange TEXT NOT NULL CHECK (exchange IN ('BINANCE', 'BYBIT')),
  market_type TEXT NOT NULL CHECK (market_type IN ('SPOT', 'PERP')),
  exchange_symbol TEXT NOT NULL,
  base_asset TEXT NOT NULL,
  quote_asset TEXT NOT NULL,
  price_tick NUMERIC(38, 18) NOT NULL,
  qty_step NUMERIC(38, 18) NOT NULL,
  min_qty NUMERIC(38, 18) NOT NULL,
  min_notional NUMERIC(38, 18),
  status TEXT NOT NULL DEFAULT 'active'
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

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  exchange_account_id UUID NOT NULL REFERENCES exchange_accounts(id),
  mt5_client_order_id TEXT NOT NULL,
  mt5_symbol TEXT NOT NULL,
  exchange TEXT NOT NULL,
  market_type TEXT NOT NULL,
  exchange_symbol TEXT NOT NULL,
  exchange_order_id TEXT,
  side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
  order_type TEXT NOT NULL CHECK (order_type IN ('MARKET', 'LIMIT')),
  quantity NUMERIC(38, 18) NOT NULL,
  price NUMERIC(38, 18),
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, mt5_client_order_id)
);

CREATE TABLE IF NOT EXISTS executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  exchange_execution_id TEXT,
  executed_quantity NUMERIC(38, 18) NOT NULL,
  executed_price NUMERIC(38, 18) NOT NULL,
  fee_asset TEXT,
  fee_amount NUMERIC(38, 18),
  executed_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  exchange_account_id UUID NOT NULL REFERENCES exchange_accounts(id),
  mt5_symbol TEXT NOT NULL,
  exchange TEXT NOT NULL,
  market_type TEXT NOT NULL,
  side TEXT NOT NULL,
  quantity NUMERIC(38, 18) NOT NULL,
  entry_price NUMERIC(38, 18),
  unrealized_pnl NUMERIC(38, 18),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, exchange_account_id, mt5_symbol, side)
);

CREATE TABLE IF NOT EXISTS risk_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  exchange_account_id UUID REFERENCES exchange_accounts(id),
  max_order_notional NUMERIC(38, 18),
  max_daily_notional NUMERIC(38, 18),
  max_leverage NUMERIC(10, 2),
  allow_spot BOOLEAN NOT NULL DEFAULT true,
  allow_perp BOOLEAN NOT NULL DEFAULT true,
  trading_enabled BOOLEAN NOT NULL DEFAULT true,
  allowed_symbols TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
