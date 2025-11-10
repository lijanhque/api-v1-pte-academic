import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from './drizzle';
import { users, accounts, pteTests, pteQuestions } from './schema';
import { mockQuestions } from './mock-data';
import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';

async function seed() {
  console.log('Seeding database...');

  // Seed sample PTE tests and questions
  const [sampleTest] = await db
    .insert(pteTests)
    .values({
      title: 'PTE Academic Sample Test 1',
      description: 'Sample practice set',
      testType: 'ACADEMIC',
      duration: '2 hours',
      isPremium: false,
    })
    .onConflictDoNothing()
    .returning();

  if (sampleTest) {
    console.log('Sample test created.');
    const testId = sampleTest.id;

    const questions = Object.entries(mockQuestions)
      .flatMap(([section, questionTypes]) =>
        Object.entries(questionTypes).flatMap(([questionType, questionList]) =>
          questionList.map((q, idx) => ({
            testId,
            section: section.toUpperCase(),
            questionType,
            question: q.title,
            questionData: JSON.stringify({ duration: q.duration }),
            correctAnswer: JSON.stringify({}),
            points: 1,
            orderIndex: idx + 1,
          }))
        )
      );

    await db.insert(pteQuestions).values(questions).onConflictDoNothing();
    console.log('PTE questions seeded.');
  } else {
    console.log('Sample test already exists.');
  }

  const email = 'test@test.com';
  const password = 'password123';

  // Find or create user
  let user = (await db.select().from(users).where(sql`email = ${email}`).limit(1))[0];
  if (!user) {
    [user] = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email,
        name: 'Test User',
        emailVerified: new Date(),
      })
      .returning();
    console.log('Initial user created.');

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(accounts).values({
      id: crypto.randomUUID(),
      userId: user.id,
      providerId: 'email',
      accountId: email,
      password: hashedPassword,
    });
    console.log('User account with password created.');
  } else {
    console.log('User already exists, checking for account.');
    const userAccount = (await db.select().from(accounts).where(sql`user_id = ${user.id} AND provider_id = 'email'`).limit(1))[0];
    if (!userAccount) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.insert(accounts).values({
        id: crypto.randomUUID(),
        userId: user.id,
        providerId: 'email',
        accountId: email,
        password: hashedPassword,
      });
      console.log('User account with password created for existing user.');
    } else {
      console.log('User account already exists.');
    }
  }
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
