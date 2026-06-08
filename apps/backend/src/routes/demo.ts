import { FastifyInstance } from 'fastify';
import { query } from '../db.js';

export const demoRoutes = async (app: FastifyInstance) => {
  app.get('/api/demo/orders', async (request, reply) => {
    const user = request.user as { userId: string } | undefined;
    if (!user?.userId) return reply.status(401).send({ error: 'Unauthorized' });
    const res = await query('SELECT id, mt5_client_order_id, mt5_symbol, side, order_type, quantity, price, status, created_at FROM orders WHERE user_id = $1 AND exchange = $2 ORDER BY created_at DESC LIMIT 200', [user.userId, 'DEMO']);
    return reply.send({ orders: res.rows });
  });

  app.get('/api/demo/executions', async (request, reply) => {
    const user = request.user as { userId: string } | undefined;
    if (!user?.userId) return reply.status(401).send({ error: 'Unauthorized' });
    const res = await query(`SELECT e.id, e.order_id, e.exchange_execution_id, e.executed_quantity, e.executed_price, e.executed_at
      FROM executions e
      JOIN orders o ON o.id = e.order_id
      WHERE o.user_id = $1 AND o.exchange = $2
      ORDER BY e.executed_at DESC LIMIT 200`, [user.userId, 'DEMO']);
    return reply.send({ executions: res.rows });
  });
};
