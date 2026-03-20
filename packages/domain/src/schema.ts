import { z } from 'zod';

// ============================================
// Authentication Schemas
// ============================================

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
});

// ============================================
// Project Schemas
// ============================================

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255),
  description: z.string().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255).optional(),
  description: z.string().optional(),
});

// ============================================
// API Key Schemas
// ============================================

export const createApiKeySchema = z.object({
  name: z.string().min(1, 'API key name is required').max(255),
  projectId: z.string().uuid('Invalid project ID'),
});

export const updateApiKeySchema = z.object({
  name: z.string().min(1, 'API key name is required').max(255).optional(),
  isActive: z.boolean().optional(),
});

// ============================================
// Event Schemas
// ============================================

export const createEventSchema = z.object({
  message: z.string().min(1, 'Error message is required'),
  stack: z.string().optional(),
  source: z.string().optional(),
  language: z.string().min(1, 'Language is required').max(50),
  framework: z.string().max(100).optional(),
  functionName: z.string().optional(),
  functionContext: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const queryEventsSchema = z.object({
  projectId: z.string().uuid('Invalid project ID').optional(),
  limit: z.number().int().positive().max(100).default(50).optional(),
  offset: z.number().int().nonnegative().default(0).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// ============================================
// Type Exports (inferred from schemas)
// ============================================

export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type UpdateApiKeyInput = z.infer<typeof updateApiKeySchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type QueryEventsInput = z.infer<typeof queryEventsSchema>;

// Made with Bob