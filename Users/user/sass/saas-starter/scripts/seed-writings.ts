import { db } from '@/lib/db';
import { writingQuestions } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

async function seedWritingQuestions() {
  const existing = await db.select().from(writingQuestions);
  if (existing.length > 0) return;

  await db.insert(writingQuestions).values([
    {
      title: 'Summarize the following text about climate change...',
      difficulty: 'Medium',
      practiced: 0,
      stats: 'N/A'
    },
    {
      title: 'Write a summary of the article about renewable energy...',
      difficulty: 'Hard',
      practiced: 5,
      stats: 'Average'
    }
  ]);
}

seedWritingQuestions();