import {
  pgTable,
  varchar,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";

export const organizations = pgTable("organizations", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name"),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  email_verified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  daily_ai_credits: integer("daily_ai_credits").notNull().default(4),
  ai_credits_used: integer("ai_credits_used").notNull().default(0),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  last_credit_reset: timestamp("last_credit_reset").defaultNow(),
  organization_id: uuid("organization_id").references(() => organizations.id),
  role: text("role").default("student"),
  targetScore: integer("target_score"),
  examDate: timestamp("exam_date"),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  account_id: text("account_id").notNull(),
  provider_id: text("provider_id").notNull(),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  access_token: text("access_token"),
  refresh_token: text("refresh_token"),
  id_token: text("id_token"),
  access_token_expires_at: timestamp("access_token_expires_at"),
  refresh_token_expires_at: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verifications = pgTable("verifications", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
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

export const pteTests = pgTable("pte_tests", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  testType: text("test_type").notNull(), // ACADEMIC, GENERAL
  duration: text("duration"),
  isPremium: boolean("is_premium").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  modifiedAt: timestamp("modified_at").notNull().defaultNow(),
});

export const pteQuestionTypes = pgTable("pte_question_types", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  description: text("description"),
});

export const pteQuestions = pgTable("pte_questions", {
  id: integer("id").primaryKey(),
  testId: text("test_id").references(() => pteTests.id), // Foreign key to pte_tests
  section: text("section").notNull(), // SPEAKING, WRITING, READING, LISTENING
  questionType: text("question_type").notNull(),
  question: text("question").notNull(),
  questionData: jsonb("question_data"), // Additional question-specific data
  correctAnswer: jsonb("correct_answer"), // Correct answer in JSON format
  points: integer("points").default(1),
  orderIndex: integer("order_index"), // Order of question in test
  title: text("title").notNull(),
  difficulty: integer("difficulty").default(0),
  totalPracticed: integer("total_practiced").default(0),
  passage: text("passage"),
  preparationTime: integer("preparation_time"),
  answerTime: integer("answer_time"),
  typeId: integer("type_id").references(() => pteQuestionTypes.id),
  media: jsonb("media"),
  choices: jsonb("choices"),
  options: jsonb("options"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  modifiedAt: timestamp("modified_at").notNull().defaultNow(),
});

export const pteQuestionTypesRelations = relations(
  pteQuestionTypes,
  ({ many }) => ({
    questions: many(pteQuestions),
  })
);

export const pteQuestionsRelations = relations(pteQuestions, ({ one }) => ({
  test: one(pteTests, {
    fields: [pteQuestions.testId],
    references: [pteTests.id],
  }),
}));

export const userSubscriptions = pgTable("user_subscriptions", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  plan: text("plan").notNull(), // 'free', 'premium', etc.
  status: text("status").notNull(), // 'active', 'cancelled', 'expired'
  stripeSubscriptionId: text("stripe_subscription_id"), // ID from Stripe
  stripeCustomerId: text("stripe_customer_id"), // Customer ID from Stripe
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  modifiedAt: timestamp("modified_at").notNull().defaultNow(),
});

export const testAttempts = pgTable("test_attempts", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  testId: text("test_id")
    .notNull()
    .references(() => pteTests.id, { onDelete: "cascade" }),
  status: text("status").notNull(), // 'in_progress', 'completed', 'abandoned'
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  totalScore: text("total_score"), // Using text to store decimal scores
  readingScore: text("reading_score"),
  writingScore: text("writing_score"),
  listeningScore: text("listening_score"),
  speakingScore: text("speaking_score"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  modifiedAt: timestamp("modified_at").notNull().defaultNow(),
});

export const testAnswers = pgTable("test_answers", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  attemptId: text("attempt_id")
    .notNull()
    .references(() => testAttempts.id, { onDelete: "cascade" }),
  questionId: integer("question_id")
    .notNull()
    .references(() => pteQuestions.id, { onDelete: "cascade" }),
  userAnswer: text("user_answer"),
  isCorrect: boolean("is_correct"), // Whether the answer was correct
  pointsEarned: text("points_earned"), // Points earned for this answer
  aiFeedback: text("ai_feedback"), // Feedback from AI
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  modifiedAt: timestamp("modified_at").notNull().defaultNow(),
});

export const userSubscriptionsRelations = relations(
  userSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [userSubscriptions.userId],
      references: [users.id],
    }),
  })
);

export const testAttemptsRelations = relations(
  testAttempts,
  ({ one, many }) => ({
    user: one(users, {
      fields: [testAttempts.userId],
      references: [users.id],
    }),
    test: one(pteTests, {
      fields: [testAttempts.testId],
      references: [pteTests.id],
    }),
    answers: many(testAnswers),
  })
);

export const testAnswersRelations = relations(testAnswers, ({ one }) => ({
  attempt: one(testAttempts, {
    fields: [testAnswers.attemptId],
    references: [testAttempts.id],
  }),
  question: one(pteQuestions, {
    fields: [testAnswers.questionId],
    references: [pteQuestions.id],
  }),
}));

export const practiceSessions = pgTable("practice_sessions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  questionId: integer("question_id")
    .notNull()
    .references(() => pteQuestions.id, { onDelete: "cascade" }),
  score: integer("score"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const practiceSessionsRelations = relations(
  practiceSessions,
  ({ one }) => ({
    user: one(users, {
      fields: [practiceSessions.userId],
      references: [users.id],
    }),
    question: one(pteQuestions, {
      fields: [practiceSessions.questionId],
      references: [pteQuestions.id],
    }),
  })
);
