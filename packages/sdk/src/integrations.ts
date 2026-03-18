import { ConsoleAI } from './index.js';

/**
 * Express.js middleware for error tracking
 */
export function expressErrorHandler(client: ConsoleAI) {
  return async (err: Error, req: any, res: any, next: any) => {
    try {
      await client.error(err);
    } catch (captureError) {
      console.error('Failed to capture error:', captureError);
    }
    
    next(err);
  };
}

/**
 * React Error Boundary integration
 */
export class ConsoleAIErrorBoundary {
  private client: ConsoleAI;

  constructor(client: ConsoleAI) {
    this.client = client;
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.client.error(error);
  }
}

/**
 * Next.js error handler
 */
export function nextErrorHandler(client: ConsoleAI) {
  return async (error: Error, context?: any) => {
    await client.error(error);
  };
}

/**
 * Fastify error handler
 */
export function fastifyErrorHandler(client: ConsoleAI) {
  return async (error: Error, request: any, reply: any) => {
    await client.error(error);
    reply.status(500).send({ error: 'Internal server error' });
  };
}

/**
 * Koa error handler
 */
export function koaErrorHandler(client: ConsoleAI) {
  return async (ctx: any, next: any) => {
    try {
      await next();
    } catch (err) {
      await client.error(err as Error);
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  };
}

/**
 * Vue.js error handler
 */
export function vueErrorHandler(client: ConsoleAI) {
  return (err: Error, vm: any, info: string) => {
    client.error(err);
  };
}

/**
 * Angular error handler
 */
export class ConsoleAIAngularErrorHandler {
  private client: ConsoleAI;

  constructor(client: ConsoleAI) {
    this.client = client;
  }

  handleError(error: Error) {
    this.client.error(error);
  }
}

// Made with Bob
