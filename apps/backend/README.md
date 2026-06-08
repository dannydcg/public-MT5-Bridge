# Backend Service

A minimal Fastify-based backend for the Crypto MT5 Bridge.

## Run locally
1. `cd apps/backend`
2. `npm install`
3. `npm run dev`

## Environment
Create a `.env` file with:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crypto_mt5_bridge
JWT_SECRET=change-this-secret
PORT=4000
```

## Endpoints
- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/mt5/tokens` (requires JWT)
- `GET /api/mt5/sessions` (requires JWT)
