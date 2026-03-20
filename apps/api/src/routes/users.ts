import { Hono } from 'hono';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { signupSchema, signinSchema, updateUserSchema } from '@console-ai/domain';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth.js';
import { eq } from 'drizzle-orm';
import { authMiddleware, createAuthRateLimit } from '../middleware/index.js';
import { ZodError } from 'zod';

const app = new Hono();

// Apply stricter rate limiting to auth endpoints
app.use('/signup', createAuthRateLimit());
app.use('/signin', createAuthRateLimit());

// POST /users/signup
app.post('/signup', async (c) => {
  try {
    const body = await c.req.json();
    const validated = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, validated.email),
    });

    if (existingUser) {
      return c.json({ error: 'User already exists' }, 400);
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(validated.password);
    const [newUser] = await db.insert(users).values({
      email: validated.email,
      password: hashedPassword,
      name: validated.name,
    }).returning();

    const token = generateToken(newUser.id);

    return c.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.createdAt,
      },
      token,
    }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /users/signin
app.post('/signin', async (c) => {
  try {
    const body = await c.req.json();
    const validated = signinSchema.parse(body);

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, validated.email),
    });

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Verify password
    const isValid = await verifyPassword(validated.password, user.password);
    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const token = generateToken(user.id);

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /users/me
app.get('/me', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PUT /users/me
app.put('/me', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();

    const validated = updateUserSchema.parse(body);

    const [updatedUser] = await db.update(users)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return c.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;

// Made with Bob
