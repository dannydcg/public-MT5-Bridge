import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
    };
  }

  interface FastifyInstance {
    authenticate(request: FastifyRequest, reply: import('fastify').FastifyReply): Promise<void>;
  }
}
