import {
  pgTable,
  varchar,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name'),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  email_verified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  daily_ai_credits: integer('daily_ai_credits').notNull().default(4),
  ai_credits_used: integer('ai_credits_used').notNull().default(0),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  last_credit_reset: timestamp('last_credit_reset').defaultNow(),
  organization_id: uuid('organization_id').references(() => organizations.id),
  role: text('role').default('student'),
  targetScore: integer('target_score'),
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  account_id: text('account_id').notNull(),
  provider_id: text('provider_id').notNull(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  access_token: text('access_token'),
  refresh_token: text('refresh_token'),
  id_token: text('id_token'),
  access_token_expires_at: timestamp('access_token_expires_at'),
  refresh_token_expires_at: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verifications = pgTable('verifications', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.organization_id],
    references: [organizations.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.user_id],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;

export const pteTests = pgTable('pte_tests', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  description: text('description'),
  testType: text('test_type').notNull(),
  duration: text('duration'),
  isPremium: boolean('is_premium').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const pteQuestions = pgTable('pte_questions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  testId: uuid('test_id').notNull().references(() => pteTests.id, { onDelete: 'cascade' }),
  section: text('section').notNull(),
  questionType: text('question_type').notNull(),
  question: text('question').notNull(),
  questionData: text('question_data'), // Store as JSON string
  correctAnswer: text('correct_answer'), // Store as JSON string
  points: integer('points').default(1),
  orderIndex: integer('order_index').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const pteTestsRelations = relations(pteTests, ({ many }) => ({
  questions: many(pteQuestions),
}));

export const pteQuestionsRelations = relations(pteQuestions, ({ one }) => ({
  test: one(pteTests, {
    fields: [pteQuestions.testId],
    references: [pteTests.id],
  }),
}));