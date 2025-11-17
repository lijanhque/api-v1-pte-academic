import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export const writingQuestions = pgTable('writing_questions', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  difficulty: varchar('difficulty', { length: 20 }).notNull(),
  practiced: serial('practiced').default(0),
  stats: text('stats').default('N/A'),
});