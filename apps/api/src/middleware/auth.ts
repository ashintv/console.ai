import { Next } from 'hono';
import { verifyToken } from '../utils/auth.js';
import { AppContextType } from '../types.js';

export async function authMiddleware(c: AppContextType, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  c.set('userId', payload.userId);
  await next();
}

export async function apiKeyMiddleware(c: AppContextType, next: Next) {
  const apiKey = c.req.header('X-API-Key');
  
  if (!apiKey) {
    return c.json({ error: 'API key required' }, 401);
  }

  c.set('apiKey', apiKey);
  await next();
}

// Made with Bob
