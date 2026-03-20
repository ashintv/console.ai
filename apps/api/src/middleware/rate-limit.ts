import { Context, Next } from 'hono';
import { AppContextType } from '../types.js';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds (default: 15 minutes)
  max?: number; // Max requests per window (default: 100)
  keyGenerator?: (c: Context) => string; // Custom key generator
  message?: string; // Custom error message
}

function getClientIp(c: Context): string {
  const forwarded = c.req.header('X-Forwarded-For');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const via = c.req.header('Via');
  if (via) {
    return via.split(',')[0].trim();
  }
  return 'unknown';
}

export function rateLimit(options: RateLimitOptions = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100,
    keyGenerator,
    message = 'Too many requests, please try again later.',
  } = options;

  return async (c: AppContextType, next: Next) => {
    const key = keyGenerator ? keyGenerator(c) : getClientIp(c);

    const now = Date.now();
    const record = store[key];

    // Reset if window expired
    if (!record || record.resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    record.count++;

    if (record.count > max) {
      const resetDate = new Date(record.resetTime);
      c.header('Retry-After', String(Math.ceil((record.resetTime - now) / 1000)));
      return c.json(
        {
          error: message,
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        },
        429
      );
    }

    return next();
  };
}

// Global rate limit (stricter for public endpoints)
export function createGlobalRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
  });
}

// Auth rate limit (stricter for login/signup)
export function createAuthRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many authentication attempts. Please try again later.',
  });
}

// API endpoint rate limit
export function createApiRateLimit() {
  return rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60,
    keyGenerator: (c) => {
      const apiKey = c.req.header('X-API-Key');
      return apiKey || getClientIp(c);
    },
  });
}

// Cleanup old entries periodically (every hour)
setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}, 60 * 60 * 1000);

