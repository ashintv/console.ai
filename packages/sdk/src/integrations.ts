import { ConsoleAI } from './index.js';
import type { ErrorData } from './index.js';

/**
 * Express.js middleware for error tracking
 */
export function expressErrorHandler(client: ConsoleAI) {
  return async (err: Error, req: any, res: any, next: any) => {
    try {
      await client.captureError(err, {
        source: req.path,
        metadata: {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          headers: req.headers,
          query: req.query,
          body: req.body,
          ip: req.ip,
        },
      });
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
    this.client.captureError(error, {
      metadata: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
    });
  }
}

/**
 * Next.js error handler
 */
export function nextErrorHandler(client: ConsoleAI) {
  return async (error: Error, context?: any) => {
    await client.captureError(error, {
      source: context?.pathname || 'unknown',
      metadata: {
        pathname: context?.pathname,
        query: context?.query,
        asPath: context?.asPath,
      },
    });
  };
}

/**
 * Fastify error handler
 */
export function fastifyErrorHandler(client: ConsoleAI) {
  return async (error: Error, request: any, reply: any) => {
    await client.captureError(error, {
      source: request.url,
      metadata: {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        headers: request.headers,
        query: request.query,
        params: request.params,
      },
    });
    
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
      await client.captureError(err as Error, {
        source: ctx.path,
        metadata: {
          method: ctx.method,
          url: ctx.url,
          statusCode: ctx.status,
          headers: ctx.headers,
          query: ctx.query,
        },
      });
      
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
    client.captureError(err, {
      metadata: {
        component: vm?.$options?.name || 'Unknown',
        lifecycle: info,
        props: vm?.$props,
      },
    });
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
    this.client.captureError(error, {
      metadata: {
        angular: true,
      },
    });
  }
}

/**
 * Fetch wrapper with error tracking
 */
export function createTrackedFetch(client: ConsoleAI) {
  return async (url: string, options?: RequestInit): Promise<Response> => {
    const startTime = Date.now();
    
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        await client.captureMessage(`HTTP ${response.status}: ${response.statusText}`, {
          source: url,
          metadata: {
            statusCode: response.status,
            method: options?.method || 'GET',
            url,
            duration: Date.now() - startTime,
          },
        });
      }
      
      return response;
    } catch (error) {
      await client.captureError(error as Error, {
        source: url,
        metadata: {
          method: options?.method || 'GET',
          url,
          duration: Date.now() - startTime,
          networkError: true,
        },
      });
      throw error;
    }
  };
}

/**
 * Axios interceptor for error tracking
 */
export function createAxiosInterceptor(client: ConsoleAI) {
  return {
    onError: async (error: any) => {
      await client.captureError(error, {
        source: error.config?.url,
        metadata: {
          method: error.config?.method,
          url: error.config?.url,
          statusCode: error.response?.status,
          data: error.config?.data,
          headers: error.config?.headers,
        },
      });
      return Promise.reject(error);
    },
  };
}

/**
 * Promise wrapper with error tracking
 */
export function trackPromise<T>(
  client: ConsoleAI,
  promise: Promise<T>,
  context?: Partial<ErrorData>
): Promise<T> {
  return promise.catch(async (error) => {
    await client.captureError(error, context);
    throw error;
  });
}

/**
 * Async function wrapper with performance tracking
 */
export function trackPerformance<T extends (...args: any[]) => Promise<any>>(
  client: ConsoleAI,
  fn: T,
  context?: Partial<ErrorData>
): T {
  return (async (...args: Parameters<T>) => {
    const startTime = Date.now();
    const startMemory = typeof process !== 'undefined' ? process.memoryUsage().heapUsed : undefined;
    
    try {
      return await fn(...args);
    } catch (error) {
      const duration = Date.now() - startTime;
      const endMemory = typeof process !== 'undefined' ? process.memoryUsage().heapUsed : undefined;
      
      await client.captureError(error as Error, {
        ...context,
        metadata: {
          ...context?.metadata,
          duration,
          memoryDelta: startMemory && endMemory ? endMemory - startMemory : undefined,
        },
      });
      throw error;
    }
  }) as T;
}

// Made with Bob
