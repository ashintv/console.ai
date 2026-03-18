import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { AppContext } from './types';

import usersRouter from './routes/users';
import projectsRouter from './routes/projects';
import eventsRouter from './routes/events';
import errorsRouter from './routes/errors';

const app = new Hono<AppContext>();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));

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
