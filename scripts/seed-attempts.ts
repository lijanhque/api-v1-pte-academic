import { db } from '../lib/db/index.js'
import { speakingAttempts, users, speakingQuestions } from '../lib/db/schema.js'
import { eq } from 'drizzle-orm'

async function seedAttempts() {
    console.log('🌱 Seeding speaking attempts...\n')

    try {
        // Get existing users
        const allUsers = await db.select().from(users).limit(3)

        if (allUsers.length < 3) {
            console.error('❌ Need at least 3 users in the database. Please sign up more users first.')
            process.exit(1)
        }

        // Get a sample question
        const [question] = await db.select().from(speakingQuestions).limit(1)

        if (!question) {
            console.error('❌ No questions found. Run pnpm db:seed first')
            process.exit(1)
        }

        console.log(`✅ Found ${allUsers.length} users`)
        console.log(`✅ Using question: ${question.title}\n`)

        // Sample scores for variety
        const sampleScores = [
            {
                overall_score: 85,
                breakdown: {
                    content: 88,
                    pronunciation: 82,
                    fluency: 85
                },
                feedback: "Excellent pronunciation and fluency. Great job maintaining natural rhythm throughout the passage.",
                suggestions: [
                    "Work on emphasizing key words for better content delivery",
                    "Practice pausing at commas and periods"
                ]
            },
            {
                overall_score: 72,
                breakdown: {
                    content: 75,
                    pronunciation: 70,
                    fluency: 71
                },
                feedback: "Good attempt with clear articulation. Some improvements needed in fluency and pacing.",
                suggestions: [
                    "Focus on reducing hesitations between words",
                    "Practice the passage multiple times for better fluency",
                    "Pay attention to word stress patterns"
                ]
            },
            {
                overall_score: 65,
                breakdown: {
                    content: 68,
                    pronunciation: 62,
                    fluency: 65
                },
                feedback: "Decent attempt but several areas need improvement. Work on pronunciation clarity and maintaining consistent pace.",
                suggestions: [
                    "Practice difficult words beforehand",
                    "Slow down to improve accuracy",
                    "Record yourself and listen for pronunciation errors"
                ]
            }
        ]

        // Create attempts for each user
        const attempts = []
        for (let i = 0; i < allUsers.length; i++) {
            const user = allUsers[i]
            const score = sampleScores[i]

            const attempt = {
                userId: user.id,
                questionId: question.id,
                type: 'read_aloud' as const,
                audioUrl: 'https://placeholder-audio-url.com/sample.m4a', // Placeholder
                transcript: question.promptText || 'Sample transcript',
                scores: score as any,
                durationMs: Math.floor(15000 + (Math.random() * 10000)), // Random duration 15-25s
                timings: {
                    prepTime: 30000,
                    recordTime: Math.floor(15000 + (Math.random() * 10000))
                } as any
            }

            attempts.push(attempt)
        }

        // Insert all attempts
        const insertedAttempts = await db.insert(speakingAttempts).values(attempts).returning()

        console.log(`✅ Created ${insertedAttempts.length} speaking attempts:\n`)

        insertedAttempts.forEach((attempt, index) => {
            const user = allUsers[index]
            console.log(`${index + 1}. User: ${user.email}`)
            console.log(`   Score: ${(attempt.scores as any).overall_score}/90`)
            console.log(`   Question: ${question.title}`)
            console.log(`   Audio URL: ${attempt.audioUrl}\n`)
        })

        console.log('✅ Seed complete! Check the Community Board at http://localhost:3000/pte/community')

    } catch (error) {
        console.error('❌ Error seeding attempts:', error)
        process.exit(1)
    }
}

seedAttempts()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Fatal error:', error)
        process.exit(1)
    })
