# Crypto MT5 Bridge Architecture

## Overview

A hosted bridge backend provides all market data and order execution for MT5 terminals. MT5 clients never connect directly to Binance or Bybit.

## Components

- `apps/backend` — central bridge service.
- `apps/dashboard` — web dashboard for user registration, API keys, risk settings, MT5 terminal tokens, and audit logs.
- `apps/mt5-ea` — MQL5 Expert Advisor, custom symbol manager, and trading panel.
- `packages/shared` — shared types/interfaces.
- `packages/exchange-adapters` — Binance and Bybit adapter implementations.
- `packages/database` — SQL migrations and schema helpers.

## Data flow

1. User registers in dashboard and configures exchange API keys.
2. Backend stores encrypted credentials and validates the exchange account.
3. MT5 EA authenticates to backend using a terminal token.
4. Backend streams normalized symbol metadata and ticks.
5. MT5 EA sends orders to backend.
6. Backend routes orders through exchange adapters and publishes fill updates back to MT5.
