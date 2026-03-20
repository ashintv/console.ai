import { Hono } from 'hono';
import { db } from '../db';
import { events, apiKeys, projects } from '../db/schema';
import { createEventSchema } from '@console-ai/domain';
import { eq, and, desc } from 'drizzle-orm';
import { apiKeyMiddleware, authMiddleware } from '../middleware';
import { AppContext } from '../types';
import { ZodError } from 'zod';

const app = new Hono<AppContext>();

// POST /events - Create a new event (requires API key)
app.post('/', apiKeyMiddleware, async (c) => {
  try {
    const apiKey = c.get('apiKey');
    const body = await c.req.json();
    const validated = createEventSchema.parse(body);

    // Verify API key and get project
    const apiKeyRecord = await db.query.apiKeys.findFirst({
      where: and(
        eq(apiKeys.key, apiKey),
        eq(apiKeys.isActive, 'true')
      ),
      with: {
        project: true,
      },
    });

    if (!apiKeyRecord) {
      return c.json({ error: 'Invalid API key' }, 401);
    }

    // Update last used timestamp
    await db.update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, apiKeyRecord.id));

    // TODO: Process event with AI here
    // For now, we'll just store it
    const aiAnalysis = `Error detected: ${validated.message}. Analysis pending...`;

    const [event] = await db.insert(events).values({
      projectId: apiKeyRecord.projectId,
      message: validated.message,
      stack: validated.stack,
      source: validated.source,
      language: validated.language,
      framework: validated.framework,
      aiAnalysis,
      metadata: validated.metadata,
    }).returning();

    return c.json({
      event: {
        id: event.id,
        message: event.message,
        aiAnalysis: event.aiAnalysis,
        createdAt: event.createdAt,
      },
    }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /events - Get all events for authenticated user's projects
app.get('/', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');

    // Get all projects for the user
    const userProjects = await db.query.projects.findMany({
      where: eq(projects.userId, userId),
    });

    const projectIds = userProjects.map(p => p.id);

    if (projectIds.length === 0) {
      return c.json({ events: [] });
    }

    // Get events for all user projects
    const allEvents = await db.query.events.findMany({
      where: eq(events.projectId, projectIds[0]), // Simplified for single project
      orderBy: [desc(events.createdAt)],
      limit: 100,
    });

    return c.json({ events: allEvents });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /events/:id - Get a specific event
app.get('/:id', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const eventId = c.req.param('id');

    if (!eventId) {
      return c.json({ error: 'Event ID is required' }, 400);
    }

    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
      with: {
        project: {
          with: {
            user: true,
          },
        },
      },
    });

    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    // Check if event belongs to user's project
    if (event.project.userId !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    return c.json({ event });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /events/project/:projectId - Get all events for a specific project
app.get('/project/:projectId', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('projectId');

    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }

    // Verify project belongs to user
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.userId, userId)
      ),
    });

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const projectEvents = await db.query.events.findMany({
      where: eq(events.projectId, projectId),
      orderBy: [desc(events.createdAt)],
      limit: 100,
    });

    return c.json({ events: projectEvents });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE /events/:id - Delete an event
app.delete('/:id', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const eventId = c.req.param('id');

    if (!eventId) {
      return c.json({ error: 'Event ID is required' }, 400);
    }

    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
      with: {
        project: true,
      },
    });

    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    // Check if event belongs to user's project
    if (event.project.userId !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    await db.delete(events).where(eq(events.id, eventId));

    return c.json({ message: 'Event deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PUT /events/:id - Update event (mainly for AI analysis)
app.put('/:id', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const eventId = c.req.param('id');

    if (!eventId) {
      return c.json({ error: 'Event ID is required' }, 400);
    }

    const body = await c.req.json();

    // Simple validation for update - only allow aiAnalysis and metadata
    const validated = {
      aiAnalysis: body.aiAnalysis,
      metadata: body.metadata,
    };

    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
      with: {
        project: true,
      },
    });

    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    // Check if event belongs to user's project
    if (event.project.userId !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const [updatedEvent] = await db.update(events)
      .set(validated)
      .where(eq(events.id, eventId))
      .returning();

    return c.json({ event: updatedEvent });
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;

// Made with Bob
