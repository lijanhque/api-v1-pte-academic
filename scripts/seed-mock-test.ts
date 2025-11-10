#!/usr/bin/env node

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { pteTests, pteQuestions } from '../lib/db/schema';
import { MOCK_TEST_QUESTIONS } from '../lib/pte/sample-data/mock-test-questions';
import { QuestionType, TestSection } from '../lib/pte/types';

const DATABASE_URL = process.env.DATABASE_URL || './db.sqlite';

// Initialize database
const client = new Database(DATABASE_URL);
const db = drizzle(client);

async function seedMockTest() {
  console.log('Seeding PTE Mock Test...');

  // Create a mock test
  const mockTestId = uuidv4();
  
  const [test] = await db.insert(pteTests).values({
    id: mockTestId,
    title: 'PTE Academic Mock Test (August 2024 Format)',
    description: 'Full 2-hour simulation of the updated PTE Academic test format with new question types',
    duration: 8100, // 2 hours 15 minutes in seconds
    isPremium: 'false',
    testType: 'MOCK',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }).returning();

  console.log(`Created mock test: ${test.title}`);

  // Insert questions
  for (const question of MOCK_TEST_QUESTIONS) {
    await db.insert(pteQuestions).values({
      id: uuidv4(),
      testId: mockTestId,
      questionType: question.type as QuestionType,
      section: question.section as TestSection,
      title: question.title,
      prompt: question.prompt,
      options: question.options ? JSON.stringify(question.options) : undefined,
      correctAnswers: question.correctAnswers ? JSON.stringify(question.correctAnswers) : undefined,
      sampleAnswer: question.sampleAnswer,
      audioUrl: question.audioUrl,
      imageUrl: question.imageUrl,
      transcript: question.transcript,
      timeLimit: question.timeLimit,
      orderIndex: MOCK_TEST_QUESTIONS.indexOf(question),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log(`Inserted question: ${question.title}`);
  }

  console.log('Mock test seeding completed!');
}

// Run the seeding function
seedMockTest().catch((error) => {
  console.error('Error seeding mock test:', error);
  process.exit(1);
});