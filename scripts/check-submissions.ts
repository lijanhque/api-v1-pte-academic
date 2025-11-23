import { db } from '../lib/db/index.js'
import { speakingAttempts, speakingQuestions, users } from '../lib/db/schema.js'
import { desc, eq } from 'drizzle-orm'

async function checkDatabase() {
    console.log('🔍 Checking Database...\n')

    // Check if we have questions
    const questions = await db.select().from(speakingQuestions).limit(1)
    console.log(`✅ Speaking Questions: ${questions.length > 0 ? 'Found' : 'None'}`)
    if (questions.length > 0) {
        console.log(`   Sample: ${questions[0].id} - ${questions[0].title}`)
    }

    // Check if we have users
    const usersList = await db.select().from(users).limit(1)
    console.log(`✅ Users: ${usersList.length > 0 ? 'Found' : 'None'}`)
    if (usersList.length > 0) {
        console.log(`   Sample: ${usersList[0].email}`)
    }

    // Check for attempts
    const attempts = await db.select()
        .from(speakingAttempts)
        .orderBy(desc(speakingAttempts.createdAt))
        .limit(5)

    console.log(`\n📊 Speaking Attempts: ${attempts.length}`)

    if (attempts.length > 0) {
        console.log('\n🎤 Recent Attempts:')
        attempts.forEach((attempt, index) => {
            console.log(`\n${index + 1}. Attempt ID: ${attempt.id}`)
            console.log(`   Question ID: ${attempt.questionId}`)
            console.log(`   User ID: ${attempt.userId}`)
            console.log(`   Audio URL: ${attempt.audioUrl}`)
            console.log(`   Transcript: ${attempt.transcript?.substring(0, 50)}...`)
            console.log(`   Scores: ${JSON.stringify(attempt.scores)}`)
            console.log(`   Created: ${attempt.createdAt}`)
        })
    } else {
        console.log('❌ No attempts found yet - Database is ready for submissions!')
    }

    console.log('\n✅ Database check complete!')
}

checkDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Error:', error)
        process.exit(1)
    })
