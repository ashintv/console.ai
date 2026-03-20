import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { AppContext } from './types';

import usersRouter from './routes/users';
import projectsRouter from './routes/projects';
import eventsRouter from './routes/events';
import errorsRouter from './routes/errors';

import {
  logger,
  createGlobalRateLimit,
  createAuthRateLimit,
  securityHeaders,
  validation,
} from './middleware';

const app = new Hono<AppContext>();

// Security and logging middleware (order matters!)
// 1. Rate limiting - should be first to protect against brute force
app.use('*', createGlobalRateLimit());

// 2. Enhanced logger - log all requests
app.use('*', logger({ level: 'info' }));

// 3. Security headers
app.use('*', securityHeaders());

// 4. CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));

// 5. Request validation
app.use('*', validation({ maxJsonSize: 1024 * 1024 }));

// Health check
app.get('/', (c) => {
  return c.json({
    message: 'Console AI API',
    version: '1.0.0',
    status: 'healthy',
  });
});

// Routes
app.route('/users', usersRouter);
app.route('/projects', projectsRouter);
app.route('/events', eventsRouter);
app.route('/errors', errorsRouter);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

const port = parseInt(process.env.PORT || '3000');

console.log(`🚀 Server starting on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`✅ Server running at http://localhost:${port}`);


// Made with Bob
