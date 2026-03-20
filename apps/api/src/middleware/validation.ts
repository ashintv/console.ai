import { Next } from 'hono';
import { AppContextType } from '../types';
import { z } from 'zod';

export interface ValidationOptions {
  maxJsonSize?: number; // Max JSON payload size in bytes (default: 1MB)
  maxUrlLength?: number; // Max URL length (default: 2048)
  allowedOrigins?: string[];
  validateContentType?: boolean;
}

// Common validation schemas
export const schemas = {
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  apiKey: z.string().min(32, 'Invalid API key format'),
  projectId: z.string().uuid('Invalid project ID'),
  userId: z.string().uuid('Invalid user ID'),
  url: z.string().url('Invalid URL format'),
};

export function validatePayloadSize(options: ValidationOptions = {}) {
  const { maxJsonSize = 1024 * 1024 } = options; // 1MB default

  return async (c: AppContextType, next: Next) => {
    const contentLength = c.req.header('Content-Length');

    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (size > maxJsonSize) {
        return c.json(
          {
            error: 'Payload too large',
            maxSize: maxJsonSize,
          },
          413
        );
      }
    }

    return next();
  };
}

export function validateUrlLength(options: ValidationOptions = {}) {
  const { maxUrlLength = 2048 } = options;

  return async (c: AppContextType, next: Next) => {
    if (c.req.url.length > maxUrlLength) {
      return c.json(
        {
          error: 'URL too long',
          maxLength: maxUrlLength,
        },
        414
      );
    }

    return next();
  };
}

export function validateContentType() {
  return async (c: AppContextType, next: Next) => {
    const method = c.req.method;

    // Skip validation for GET, DELETE, and HEAD
    if (['GET', 'DELETE', 'HEAD', 'OPTIONS'].includes(method)) {
      return next();
    }

    const contentType = c.req.header('Content-Type');
    const path = new URL(c.req.url).pathname;

    // These endpoints should accept application/json
    if (
      (method === 'POST' || method === 'PUT' || method === 'PATCH') &&
      contentType &&
      !contentType.includes('application/json')
    ) {
      return c.json(
        {
          error: 'Invalid Content-Type. Expected application/json',
        },
        415
      );
    }

    return next();
  };
}

export function validateRequestHeaders() {
  return async (c: AppContextType, next: Next) => {
    const method = c.req.method;

    // Check for required headers on POST/PUT
    if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && c.req.header('Content-Length') === undefined) {
      // Content-Length can be undefined for some streaming requests, so this is optional
    }

    return next();
  };
}

// Validation helper for request body
export async function validateBody<T>(
  c: AppContextType,
  schema: z.ZodSchema<T>
): Promise<{ data?: T; error?: string }> {
  try {
    const body = await c.req.json();
    const validated = schema.parse(body);
    return { data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      return { error: messages.join(', ') };
    }
    return { error: 'Invalid request body' };
  }
}

// Validation helper for query parameters
export function validateQuery<T>(c: AppContextType, schema: z.ZodSchema<T>): { data?: T; error?: string } {
  try {
    const query = c.req.query();
    const validated = schema.parse(query);
    return { data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      return { error: messages.join(', ') };
    }
    return { error: 'Invalid query parameters' };
  }
}

// Combined validation middleware
export function validation(options: ValidationOptions = {}) {
  return async (c: AppContextType, next: Next) => {
    // Apply all validations
    const checks = [
      validatePayloadSize(options),
      validateUrlLength(options),
      validateContentType(),
      validateRequestHeaders(),
    ];

    // Run checks in sequence
    let nextFn: any = next;
    for (let i = checks.length - 1; i >= 0; i--) {
      const check = checks[i];
      const currentNext = nextFn;
      nextFn = () => check(c, currentNext);
    }

    return nextFn();
  };
}
