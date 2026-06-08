import { FastifyInstance } from 'fastify';
import { query } from '../db.js';
import crypto from 'crypto';

export async function authRoutes(app: FastifyInstance) {
  app.post('/api/auth/register', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };
    if (!email || !password) {
      return reply.status(400).send({ error: 'email and password are required' });
    }

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    try {
      await query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
        [email.toLowerCase(), passwordHash]
      );
      return reply.status(201).send({ email });
    } catch (error) {
      return reply.status(409).send({ error: 'User already exists' });
    }
  });

  app.post('/api/auth/login', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };
    if (!email || !password) {
      return reply.status(400).send({ error: 'email and password are required' });
    }

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    const result = await query('SELECT id FROM users WHERE email = $1 AND password_hash = $2', [email.toLowerCase(), passwordHash]);
    if (result.rowCount === 0) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const token = app.jwt.sign({ userId: user.id });
    return reply.send({ token });
  });
}
