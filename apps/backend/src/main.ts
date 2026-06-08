import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyHelmet from '@fastify/helmet';
import fastifyCookie from '@fastify/cookie';
import dotenv from 'dotenv';
import { initDatabase } from './db.js';
import { authRoutes } from './routes/auth.js';
import { mt5Routes } from './routes/mt5.js';
import websocket from '@fastify/websocket';
import { wsRoutes } from './routes/ws.js';
import { pollRoutes } from './routes/poll.js';
import { demoRoutes } from './routes/demo.js';
import { startOrderRouter } from './services/orderRouter.js';

dotenv.config();

const app = Fastify({ logger: true });

app.register(fastifyHelmet);
app.register(fastifyCookie);
app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET ?? 'change-this-secret'
});

app.register(websocket);

app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.send(err);
  }
});

app.get('/health', async () => ({ status: 'ok' }));

app.register(authRoutes);
app.register(async (instance) => {
  instance.addHook('preHandler', instance.authenticate);
  await mt5Routes(instance);
});

app.register(async (instance) => {
  // allow MT5 terminals to connect without JWT auth, they authenticate with token
  await wsRoutes(instance);
});

app.register(async (instance) => {
  // HTTP polling endpoint for MT5 terminals using WebRequest
  await pollRoutes(instance);
});

app.register(async (instance) => {
  instance.addHook('preHandler', instance.authenticate);
  await demoRoutes(instance);
});

// start background order router
startOrderRouter().catch(err => app.log.error('order router failed', err));

const start = async () => {
  try {
    await initDatabase();
    await app.listen({ port: Number(process.env.PORT ?? 4000), host: '0.0.0.0' });
    app.log.info('Backend started');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
