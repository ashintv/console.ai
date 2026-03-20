import { Hono } from 'hono';
import { db } from '../db';
import { projects, apiKeys } from '../db/schema';
import { createProjectSchema, updateProjectSchema, createApiKeySchema } from '@console-ai/domain';
import { eq, and } from 'drizzle-orm';
import { authMiddleware } from '../middleware';
import { generateApiKey } from '../utils/auth';
import { AppContext } from '../types';
import { ZodError } from 'zod';

const app = new Hono<AppContext>();

// All routes require authentication
app.use('/*', authMiddleware);

// POST /projects - Create a new project
app.post('/', async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const validated = createProjectSchema.parse(body);

    const [project] = await db.insert(projects).values({
      userId,
      name: validated.name,
      description: validated.description,
    }).returning();

    // Generate an API key for the project
    const key = generateApiKey();
    const [apiKeyRecord] = await db.insert(apiKeys).values({
      projectId: project.id,
      key,
      name: 'Default API Key',
    }).returning();

    return c.json({
      project,
      apiKey: {
        id: apiKeyRecord.id,
        key: apiKeyRecord.key,
        name: apiKeyRecord.name,
        createdAt: apiKeyRecord.createdAt,
      },
    }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /projects - Get all projects for the authenticated user
app.get('/', async (c) => {
  try {
    const userId = c.get('userId');

    const userProjects = await db.query.projects.findMany({
      where: eq(projects.userId, userId),
      with: {
        apiKeys: true,
      },
    });

    return c.json({ projects: userProjects });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /projects/:id - Get a specific project
app.get('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('id');

    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }

    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.userId, userId)
      ),
      with: {
        apiKeys: true,
      },
    });

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    return c.json({ project });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PUT /projects/:id - Update a project
app.put('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('id');

    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }

    const body = await c.req.json();
    const validated = updateProjectSchema.parse(body);

    // Check if project exists and belongs to user
    const existingProject = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.userId, userId)
      ),
    });

    if (!existingProject) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const [updatedProject] = await db.update(projects)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning();

    return c.json({ project: updatedProject });
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE /projects/:id - Delete a project
app.delete('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('id');

    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }

    // Check if project exists and belongs to user
    const existingProject = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.userId, userId)
      ),
    });

    if (!existingProject) {
      return c.json({ error: 'Project not found' }, 404);
    }

    await db.delete(projects).where(eq(projects.id, projectId));

    return c.json({ message: 'Project deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /projects/:id/api-keys - Generate a new API key for a project
app.post('/:id/api-keys', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('id');

    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }

    const body = await c.req.json();

    const validated = createApiKeySchema.parse({
      ...body,
      projectId,
    });

    // Check if project exists and belongs to user
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.userId, userId)
      ),
    });

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const key = generateApiKey();
    const [apiKeyRecord] = await db.insert(apiKeys).values({
      projectId,
      key,
      name: validated.name,
    }).returning();

    return c.json({
      apiKey: {
        id: apiKeyRecord.id,
        key: apiKeyRecord.key,
        name: apiKeyRecord.name,
        createdAt: apiKeyRecord.createdAt,
      },
    }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /projects/:id/api-keys - Get all API keys for a project
app.get('/:id/api-keys', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('id');

    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }

    // Check if project exists and belongs to user
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.userId, userId)
      ),
    });

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const keys = await db.query.apiKeys.findMany({
      where: eq(apiKeys.projectId, projectId),
    });

    return c.json({ apiKeys: keys });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE /projects/:projectId/api-keys/:keyId - Delete an API key
app.delete('/:projectId/api-keys/:keyId', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('projectId');
    const keyId = c.req.param('keyId');

    if (!projectId || !keyId) {
      return c.json({ error: 'Project ID and Key ID are required' }, 400);
    }

    // Check if project exists and belongs to user
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.userId, userId)
      ),
    });

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Check if API key exists and belongs to project
    const apiKey = await db.query.apiKeys.findFirst({
      where: and(
        eq(apiKeys.id, keyId),
        eq(apiKeys.projectId, projectId)
      ),
    });

    if (!apiKey) {
      return c.json({ error: 'API key not found' }, 404);
    }

    await db.delete(apiKeys).where(eq(apiKeys.id, keyId));

    return c.json({ message: 'API key deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;

// Made with Bob
