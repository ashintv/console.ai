import { text, timestamp, uuid, varchar, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { pgTable } from "drizzle-orm/pg-core";

// ============================================
// Users Table
// ============================================
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: text('password').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
}));

// ============================================
// Projects Table
// ============================================
export const projects = pgTable('projects', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('projects_user_id_idx').on(table.userId),
    nameIdx: index('projects_name_idx').on(table.name),
}));

// ============================================
// API Keys Table
// ============================================
export const apiKeys = pgTable('api_keys', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
    key: varchar('key', { length: 64 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    lastUsedAt: timestamp('last_used_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    isActive: varchar('is_active', { length: 10 }).notNull().default('true'),
}, (table) => ({
    projectIdIdx: index('api_keys_project_id_idx').on(table.projectId),
    keyIdx: index('api_keys_key_idx').on(table.key),
}));

// ============================================
// Events Table
// ============================================
export const events = pgTable('events', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
    message: text('message').notNull(),
    stack: text('stack'),
    source: text('source'),
    language: varchar('language', { length: 50 }).notNull(),
    framework: varchar('framework', { length: 100 }),
    functionName: varchar('function_name', { length: 255 }),
    functionContext: text('function_context'),
    aiAnalysis: text('ai_analysis'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    projectIdIdx: index('events_project_id_idx').on(table.projectId),
    createdAtIdx: index('events_created_at_idx').on(table.createdAt),
    languageIdx: index('events_language_idx').on(table.language),
}));

// ============================================
// Relations
// ============================================
export const usersRelations = relations(users, ({ many }) => ({
    projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
    user: one(users, {
        fields: [projects.userId],
        references: [users.id],
    }),
    apiKeys: many(apiKeys),
    events: many(events),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
    project: one(projects, {
        fields: [apiKeys.projectId],
        references: [projects.id],
    }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
    project: one(projects, {
        fields: [events.projectId],
        references: [projects.id],
    }),
}));

// Made with Bob