# Crypto MT5 Bridge

Monorepo for the Crypto Exchange to MT5 Bridge project.

## Structure
- `apps/backend` — hosted bridge backend service.
- `apps/dashboard` — web dashboard for account and MT5 token management.
- `apps/mt5-ea` — MQL5 Expert Advisor and UI integration.
- `packages/shared` — shared TypeScript types and utilities.
- `packages/exchange-adapters` — exchange adapter implementations.
- `packages/database` — schema, migrations, and database helpers.
- `infra` — docker and infrastructure templates.

## Getting started
1. Install dependencies: `npm install`
2. Configure `.env` in `apps/backend` if needed.
3. Run backend in development: `npm run dev:backend`

## Notes
- The backend uses PostgreSQL and expects `DATABASE_URL` to be set.
- MT5 terminals connect only to the hosted bridge, not directly to Binance or Bybit.
- The project is currently scaffolded for Milestone 1.
