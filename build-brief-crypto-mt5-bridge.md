# Build Brief: Crypto Exchange to MT5 Bridge

## Project Vision
Provide a secure, multi-user platform that lets traders view live Binance and Bybit market data inside MetaTrader 5 and execute crypto trades from MT5 using a custom trading panel, while managing exchange API keys, risk rules, and MT5 access tokens via a centralized web dashboard.

## Key User Goals
1. View live Binance and Bybit crypto data inside MT5 using custom symbols.
2. Trade Binance and Bybit from MT5 using a custom MT5 trading panel.
3. Manage accounts, exchange API keys, risk settings, and MT5 access tokens from a web dashboard.
4. Support multi-user operation with strict isolation between users.

## Product Scope
- Exchanges: Binance, Bybit.
- Market types: Spot and USDT perpetual futures.
- MT5 Integration: MT5 Expert Advisor, custom symbols, and custom trading panel only.
- MVP constraint: do not build a native MT5 server/broker plugin.

## Target Architecture

User MT5 Terminal
  └── MT5 Expert Advisor
        ├── Custom Symbol Manager
        ├── Custom Trading Panel
        └── WebSocket/HTTPS Client
              │
              ▼
Central Hosted Bridge
  ├── API Gateway
  ├── Auth Service
  ├── MT5 Session Service
  ├── Exchange Account Service
  ├── Market Data Service
  ├── Order Router
  ├── Risk Engine
  ├── Execution Service
  ├── Binance Spot Adapter
  ├── Binance Perp Adapter
  ├── Bybit Spot Adapter
  ├── Bybit Perp Adapter
  ├── PostgreSQL
  └── Redis or NATS

## Core Components

### 1. Crypto Bridge Backend
- Connects to Binance and Bybit market data feeds.
- Normalizes prices and order book updates into a common format.
- Exposes a secure API for MT5 to retrieve custom symbol ticks and to submit trade orders.
- Stores user credentials, exchange API keys, risk settings, and MT5 token mappings.

### 2. MT5 Bridge Layer
- Custom MT5 EA or plugin acts as the MT5 client.
- Registers custom symbols within MT5 for Binance/Bybit instruments.
- Feeds live ticks into MT5 via `SymbolInfo`, `ChartCreate`, or a dedicated MT5 data server.
- Sends trade signals from MT5 to the bridge backend.
- Handles execution callbacks and order status updates back into MT5.

### 3. MT5 Trading Panel
- Custom panel inside MT5 UI (MQL5 Expert Advisor with dialog or webview).
- Displays available crypto symbols, account balances, and position state.
- Provides entry/exit order management and stop/take profit controls.
- Shows real-time execution confirmation and error handling.

### 4. Web Dashboard
- Tenant-aware dashboard for users and admins.
- User onboarding, login, and profile management.
- API key onboarding for Binance and Bybit.
- Risk settings management: max exposure, max order size, max leverage, permitted instruments.
- MT5 access token issuance and refresh management.
- User activity logs and audit trail.

## Architecture Overview

### Deployment Model
- Use a central hosted backend for all market data and trade routing.
- MT5 terminals must never connect directly to Binance or Bybit.
- MT5 connects only to the hosted bridge backend via a secure MT5 access token.
- The hosted backend is the single gateway for all exchange communication.

### Data Flow
1. User registers and configures exchange API keys in the dashboard.
2. The bridge backend validates keys with Binance/Bybit and stores encrypted credentials.
3. MT5 client authenticates with the backend using an MT5 access token.
4. Bridge backend subscribes to live market data for the user’s selected symbols.
5. Backend pushes normalized ticks to the MT5 client for custom MT5 symbols.
6. User places an order from MT5 panel.
7. MT5 client sends order request to bridge backend.
8. Backend applies risk checks, routes the order to Binance/Bybit, and returns execution status.
9. Order fills and position updates are relayed back into MT5.

### Multi-User Isolation
- Each user has a separate account record.
- Exchange API keys are encrypted at rest and separated by user.
- MT5 access tokens are mapped to specific user accounts and expire periodically.
- Authorization service ensures requests only access the caller’s symbols and orders.
- Dashboard RBAC: admin, trader, operations.

## Functional Requirements

### Live Market Data
- Support Binance and Bybit market data via WebSocket and/or REST.
- Offer custom MT5 symbols for crypto pairs like `BTCUSDT`, `ETHUSDT`, `SOLUSDT`, etc.
- Provide bid/ask, last price, volume, timestamp.
- Update prices frequently enough for MT5 charting and strategy use.
- Handle symbol mapping/normalization across exchanges.

### Trading from MT5
- Allow market, limit, stop, and OCO order entry from MT5.
- Support order modifications and cancellations.
- Provide trade confirmation and fill status inside MT5.
- Mirror positions in the exchange account.
- Support both manual and EA-driven execution.

### Web Dashboard
- User login/register and secure authentication.
- Dashboard for API key entry and validation.
- Risk profile settings per user.
- MT5 token generation and easy connection instructions.
- Logs for orders, price subscriptions, token usage.
- Support for multiple simultaneous users.

## Non-Functional Requirements
- Strong security: TLS for all traffic; encrypted storage for API credentials.
- Low-latency feeds suitable for MT5 charting.
- Reliable reconnection and order retry logic.
- Precise user isolation to prevent data leakage.
- Scalable: multiple users, multiple MT5 terminals.
- Highly auditable operations for trades and credential changes.

## Suggested Technology Stack

### Backend Bridge Service
- TypeScript
- NestJS or Fastify
- PostgreSQL
- Redis or NATS
- Docker
- AWS KMS / GCP KMS / HashiCorp Vault for secrets

### Backend Responsibilities
- User authentication
- MT5 terminal token authentication
- Exchange API key storage and encryption
- Symbol metadata normalization
- Market data streaming
- Order routing
- Risk checks
- Execution tracking
- User isolation
- Audit logging

### MT5 Integration
- MQL5 Expert Advisor for custom symbol handling and order routing.
- HTTP/WebSocket client in MQL5 using `WebRequest`.
- Custom symbols loaded into MT5 via `SymbolCreate`, plus tick injection.
- Use MT5 EA and panel integration only; do not build a native MT5 server/broker plugin for MVP.

### Frontend
- Web dashboard: React, Vue, or Svelte.
- Admin pages: user/account management, risk settings.
- Mobile-friendly layout for account monitoring.

### Deployment
- Containerized services (Docker).
- HTTPS endpoints with valid TLS.
- Central hosted backend is the system of record for market feeds and trade execution.
- Local MT5 terminals connect only to the hosted bridge backend over secure API.
- MT5 does not connect directly to Binance or Bybit.

## Implementation Plan

### Phase 1: MVP
- Build backend connector for Binance market data and trades.
- Build simple web dashboard for user login and API key entry.
- Create MT5 EA that shows custom symbol prices and can send simple market orders.
- Implement one user account flow.

### Phase 2: MT5 Panel + Risk Controls
- Add fully-featured MT5 trading panel.
- Add risk settings and order validation rules.
- Add token-based MT5 authentication.
- Enable exchange key validation and encrypted storage.

### Phase 3: Multi-User & Bybit Support
- Add explicit multi-user isolation and RBAC.
- Add Bybit market/trade integration.
- Harden security, logging, and error handling.
- Add dashboard audit logs and user management.

### Phase 4: Polish and Scale
- Improve latency for custom symbol tick injection.
- Add support for more crypto pairs and instrument syncing.
- Add system monitoring, metrics, and alerting.
- Add documentation and onboarding guides.

## Risks & Mitigations
- Exchange rate limits: use websocket feeds and rate-limit order submissions.
- MT5 custom symbol limitations: validate symbol registration and fallback gracefully.
- Data latency: keep connection alive, use heartbeat/reconnect logic.
- Security of API keys: encrypt with server-side secrets and limit scope.
- Misrouted orders: validate mapping and require explicit consent for each user.

## Recommended Deliverables
- `build-brief-crypto-mt5-bridge.md`
- `api` service for brokerage and market feed.
- `dashboard` web application.
- `mt5-gateway` MQL5 EA and configuration guide.
- Documentation for setup, user onboarding, and token registration.

---

## Web Dashboard

### Suggested stack
```
Next.js
React
Tailwind or equivalent UI framework
```

### Dashboard pages
```
/login
/register
/dashboard
/exchange-accounts
/symbols
/risk-settings
/mt5-sessions
/orders
/positions
/executions
/admin/users
/admin/system-health
```

### Dashboard features
- Register/login
- Add Binance API keys
- Add Bybit API keys
- Validate API keys
- Enable/disable trading
- Enable/disable spot trading
- Enable/disable perpetual futures trading
- Configure allowed symbols
- Configure risk limits
- Generate MT5 terminal token
- Revoke MT5 terminal token
- View orders
- View fills
- View positions
- View balances
- View audit logs

---

## MT5 Expert Advisor

Build in **MQL5**.

### Responsibilities
- Connect to hosted bridge
- Authenticate using terminal token
- Create/update MT5 custom symbols
- Display live bid/ask/last prices
- Render custom trading panel
- Send order requests
- Cancel open orders
- Show order status
- Show fill updates

The EA must not store exchange API keys.

### EA settings example
```
input string BridgeServerUrl = "wss://bridge.example.com/mt5";
input string TerminalToken = "mt5_live_xxxxxxxxxxxxx";
input bool UseTestnet = true;
```

---

## MT5 Trading Panel

Build a visual panel inside MT5.

### Panel must include
```
Connection status
User/account label
Live/testnet mode

Exchange selector:
  Binance
  Bybit

Market selector:
  Spot
  Perpetual

Symbol selector:
  BTCUSDT
  ETHUSDT
  etc.

Price display:
  Bid
  Ask
  Last
  Spread

Order controls:
  Buy
  Sell
  Market
  Limit
  Quantity
  Limit price
  Reduce-only for futures

Actions:
  Place Order
  Cancel Selected Order

Tables:
  Open orders
  Recent fills
  Positions for futures
```

### Suggested layout
```
+--------------------------------------------------+
| Crypto Bridge                                    |
+--------------------------------------------------+
| Status: Connected                                |
| User: user@example.com                           |
| Mode: Live / Testnet                             |
+--------------------------------------------------+
| Exchange: [Binance v]                            |
| Market:   [PERP v]                               |
| Symbol:   [BTCUSDT v]                            |
+--------------------------------------------------+
| Bid: 69420.10     Ask: 69420.20                  |
| Last: 69420.15    Spread: 0.10                   |
+--------------------------------------------------+
| Side:      [Buy] [Sell]                          |
| Type:      [Market v]                            |
| Quantity:  [0.010]                               |
| Price:     [disabled for market]                 |
| Reduce Only: [ ]                                 |
+--------------------------------------------------+
| [Place Order] [Cancel Selected]                  |
+--------------------------------------------------+
| Open Orders                                      |
| #12345 BTCUSDT BUY LIMIT 0.01 @ 69000 ACCEPTED   |
+--------------------------------------------------+
| Recent Fills                                     |
| BTCUSDT BUY 0.01 @ 69001.5                       |
+--------------------------------------------------+
```

---

## Symbol Naming Convention

Use this MT5 symbol format:
```
<EXCHANGE>.<MARKET_TYPE>.<EXCHANGE_SYMBOL>
```

Examples:
```
BINANCE.SPOT.BTCUSDT
BINANCE.PERP.BTCUSDT
BYBIT.SPOT.ETHUSDT
BYBIT.PERP.ETHUSDT
```

Each MT5 symbol maps to one exchange symbol.

Example symbol metadata:
```
{
  "mt5_symbol": "BINANCE.PERP.BTCUSDT",
  "exchange": "BINANCE",
  "market_type": "PERP",
  "exchange_symbol": "BTCUSDT",
  "base_asset": "BTC",
  "quote_asset": "USDT",
  "price_tick": "0.10",
  "qty_step": "0.001",
  "min_qty": "0.001",
  "min_notional": "5"
}
```

---

## WebSocket Message Contract

### EA → Backend: Subscribe Symbols
```
{
  "type": "subscribe_symbols",
  "symbols": [
    "BINANCE.PERP.BTCUSDT",
    "BYBIT.SPOT.ETHUSDT"
  ]
}
```

### Backend → EA: Symbol Metadata
```
{
  "type": "symbol_metadata",
  "symbols": [
    {
      "mt5_symbol": "BINANCE.PERP.BTCUSDT",
      "digits": 2,
      "price_tick": "0.10",
      "qty_step": "0.001",
      "min_qty": "0.001",
      "min_notional": "5"
    }
  ]
}
```

### Backend → EA: Tick
```
{
  "type": "tick",
  "symbol": "BINANCE.PERP.BTCUSDT",
  "bid": "69420.10",
  "ask": "69420.20",
  "last": "69420.15",
  "volume": "12.384",
  "exchange_time": "2026-06-06T12:00:00.000Z"
}
```

### EA → Backend: Place Order
```
{
  "type": "place_order",
  "request_id": "req_123",
  "symbol": "BINANCE.PERP.BTCUSDT",
  "side": "BUY",
  "order_type": "LIMIT",
  "quantity": "0.01",
  "price": "69000",
  "reduce_only": false
}
```

> Important: the EA must not send `user_id`. The backend must derive the user from the authenticated MT5 terminal token.

### Backend → EA: Order Update
```
{
  "type": "order_update",
  "request_id": "req_123",
  "mt5_order_id": "mt5-123456",
  "bridge_order_id": "ord_abc",
  "exchange": "BINANCE",
  "exchange_order_id": "987654321",
  "symbol": "BINANCE.PERP.BTCUSDT",
  "status": "ACCEPTED",
  "filled_quantity": "0",
  "average_price": null
}
```

### Backend → EA: Fill Update
```
{
  "type": "fill",
  "bridge_order_id": "ord_abc",
  "symbol": "BINANCE.PERP.BTCUSDT",
  "side": "BUY",
  "quantity": "0.01",
  "price": "69001.5",
  "fee_asset": "USDT",
  "fee_amount": "0.0276",
  "exchange_time": "2026-06-06T12:00:01.250Z"
}
```

---

## Exchange Adapter Interface

Create a common exchange adapter interface.
```
interface ExchangeAdapter {
  getExchangeInfo(): Promise<any>;
  getBalances(userId: string): Promise<any>;
  getPositions(userId: string): Promise<any>;
  placeOrder(userId: string, order: NormalizedOrder): Promise<any>;
  cancelOrder(userId: string, orderId: string): Promise<any>;
  streamMarketData(symbols: string[]): AsyncIterable<any>;
  streamUserEvents(userId: string): AsyncIterable<any>;
}
```

Implement:
```
BinanceSpotAdapter
BinancePerpAdapter
BybitSpotAdapter
BybitPerpAdapter
```

Use:
```
REST for order submission
WebSocket for market data
WebSocket/user stream for order updates where possible
REST polling fallback every 3–5 seconds
```

---

## Database Schema

Use PostgreSQL.

### users
```
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### exchange_accounts
```
CREATE TABLE exchange_accounts (
  id UUID PRIMARY KEY,
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
```

### symbols
```
CREATE TABLE symbols (
  id UUID PRIMARY KEY,
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
```

### mt5_terminal_tokens
```
CREATE TABLE mt5_terminal_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);
```

### mt5_sessions
```
CREATE TABLE mt5_sessions (
  id UUID PRIMARY KEY,
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
```

### orders
```
CREATE TABLE orders (
  id UUID PRIMARY KEY,
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
```

### executions
```
CREATE TABLE executions (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id),
  exchange_execution_id TEXT,
  executed_quantity NUMERIC(38, 18) NOT NULL,
  executed_price NUMERIC(38, 18) NOT NULL,
  fee_asset TEXT,
  fee_amount NUMERIC(38, 18),
  executed_at TIMESTAMPTZ NOT NULL
);
```

### positions
```
CREATE TABLE positions (
  id UUID PRIMARY KEY,
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
```

### risk_settings
```
CREATE TABLE risk_settings (
  id UUID PRIMARY KEY,
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
```

### audit_logs
```
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Security Requirements

API keys must never be stored or logged in plaintext.

Use:
```
AWS KMS
GCP KMS
HashiCorp Vault
```

### Security rules
- Encrypt exchange API keys at rest.
- Decrypt only inside exchange adapter runtime.
- Never log API secrets.
- Redact all secrets from errors.
- MT5 EA must never receive exchange credentials.
- WebSocket session must belong to exactly one authenticated user.
- Backend must derive `user_id` from the authenticated session.
- Do not trust `user_id` from client payloads.
- Every order must be checked against user permissions.
- Every order must be checked against risk settings.
- Users must not see other users’ balances, orders, trades, symbols, sessions, or keys.

---

## Risk Engine MVP

Before placing any order, check:
```
User status is active
MT5 token is active
Trading is enabled
Exchange account is active
Symbol is enabled
Market type is allowed
Quantity >= min_qty
Quantity matches qty_step
Limit price matches price_tick
Order notional >= min_notional
Order notional 
```

Reject the order if any check fails.

---

## Order Lifecycle

Use these normalized statuses:
```
NEW
VALIDATING
REJECTED
SUBMITTED
ACCEPTED
PARTIALLY_FILLED
FILLED
CANCEL_REQUESTED
CANCELED
FAILED
EXPIRED
```

Order flow:
```
MT5 Panel
  → EA
  → Backend Gateway
  → Order Router
  → Risk Engine
  → Exchange Adapter
  → Binance/Bybit
  → Exchange Adapter
  → Execution Service
  → Database
  → Backend Gateway
  → EA
  → MT5 Panel
```

---

## Implementation Milestones

### Milestone 1: Skeleton System

Deliver:
- Backend project
- PostgreSQL migrations
- User registration/login
- Dashboard shell
- MT5 terminal token generation
- MT5 EA connection test

Acceptance criteria:
```
User can register.
User can log in.
User can generate an MT5 terminal token.
MT5 EA can connect to backend using token.
Backend records MT5 session.
```

---

### Milestone 2: Market Data MVP

Deliver:
- Binance spot market data
- Binance perpetual market data
- Bybit spot market data
- Bybit perpetual market data
- Normalized tick stream
- MT5 custom symbol creation/update

Acceptance criteria:
```
MT5 displays live BTCUSDT and ETHUSDT charts.
Supports Binance spot.
Supports Binance perpetual.
Supports Bybit spot.
Supports Bybit perpetual.
Ticks update without restarting MT5.
```

---

### Milestone 3: Trading MVP

Deliver:
- Market orders
- Limit orders
- Cancel orders
- Order status updates
- Fill storage
- MT5 panel order submission

Acceptance criteria:
```
User places testnet market order from MT5.
User places testnet limit order from MT5.
Order appears on Binance/Bybit.
Order status returns to MT5.
Fill update returns to MT5.
Order and fill are stored in PostgreSQL.
```

---

### Milestone 4: Multi-User MVP

Deliver:
- Per-user exchange keys
- Per-user MT5 tokens
- User isolation
- Risk settings
- Audit logs
- Multiple simultaneous MT5 sessions

Acceptance criteria:
```
Two users can connect separate MT5 terminals.
Each user trades only using their own API keys.
User A cannot see User B’s data.
Risk settings are enforced per user.
```

---

### Milestone 5: Production Readiness

Deliver:
- Monitoring
- Alerting
- Exchange reconnect handling
- Rate-limit handling
- Dead-letter queue
- Admin dashboard
- Kill switch
- Testnet/live separation

Acceptance criteria:
```
System runs for 7 days on testnet.
No unrecovered market data feed failures.
No duplicate orders.
No unmapped fills.
No plaintext API-key logs.
No cross-user data leakage.
```

---

## Performance Targets

### Market Data
```
Exchange → Backend tick latency: under 250 ms typical
Backend → MT5 tick latency: under 250 ms typical
Stale feed detection: within 5 seconds
```

### Trading
```
MT5 → Backend validation: under 100 ms typical
Backend → Exchange accepted: under 1 second typical
Duplicate orders: 0
Unmapped exchange fills: 0
```

### Security
```
Cross-user data access incidents: 0
Plaintext API key logs: 0
Unauthorized order attempts accepted: 0
```

---

## Important MVP Limitation

This system uses MT5 custom symbols and an Expert Advisor. It is **not** a native MT5 broker/server plugin.

That means:
- MT5 can display crypto charts.
- MT5 can show a custom trading panel.
- MT5 can send orders to the backend.
- The backend executes those orders on Binance/Bybit.

But:
- MT5’s native broker account model is not fully replaced.
- Full broker-style account integration would require a native MT5 server plugin later.

---

node "apps/backend/tools/ws-client.js" "ws://localhost:8081/?token=test&symbols=BTCUSDT,ETHUSDT"## First Build Task for AI Agent

Start by creating the monorepo:
```
crypto-mt5-bridge/
  apps/
    backend/
    dashboard/
    mt5-ea/
  packages/
    shared/
    exchange-adapters/
    database/
  infra/
    docker/
    migrations/
    terraform/
  docs/
```

Then implement Milestone 1 first.

Do not start trading functionality until:
```
Authentication works
Database migrations work
MT5 token generation works
MT5 EA can connect to backend
Session is recorded in PostgreSQL
```

---

 