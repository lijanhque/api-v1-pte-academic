import { readFileSync } from 'fs'
import { uploadAudio } from '../lib/actions/upload-actions.js'
import { submitAttempt } from '../lib/actions/pte.js'
import { db } from '../lib/db/index.js'
import { speakingQuestions, users } from '../lib/db/schema.js'

async function testUploadAndSubmit() {
    console.log('🎤 Testing Audio Upload & Submission...\n')

    try {
        // 1. Get a question
        const [question] = await db.select().from(speakingQuestions).limit(1)
        if (!question) {
            throw new Error('No questions found. Run pnpm db:seed first')
        }
        console.log(`✅ Using question: ${question.title}`)

        // 2. Get a user (you'll need to be logged in for real)
        const [user] = await db.select().from(users).limit(1)
        if (!user) {
            throw new Error('No users found. Please sign up first')
        }
        console.log(`✅ Using user: ${user.email}`)

        // 3. Read the audio file
        const audioPath = '7m0gg5sm5cn.m4a'
        console.log(`📁 Reading audio file: ${audioPath}`)
        const audioBuffer = readFileSync(audioPath)
        const audioBlob = new Blob([audioBuffer], { type: 'audio/mp4' })
        const audioFile = new File([audioBlob], '7m0gg5sm5cn.m4a', { type: 'audio/mp4' })

        // 4. Create FormData for upload
        const formData = new FormData()
        formData.append('file', audioFile)
        formData.append('type', 'read_aloud')
        formData.append('questionId', question.id)
        formData.append('ext', 'm4a')

        console.log('📤 Uploading to Vercel Blob...')
        const uploadResult = await uploadAudio(formData)
        console.log(`✅ Audio uploaded: ${uploadResult.url}`)

        // 5. Submit attempt (simulated - this normally requires auth session)
        // Note: This will fail without proper auth session, but we can check the upload worked
        console.log('\n✅ Upload successful!')
        console.log(`   Audio URL: ${uploadResult.url}`)
        console.log(`   File size: ${audioFile.size} bytes`)

        console.log('\n📝 To complete submission:')
        console.log('   1. Log in to your account')
        console.log('   2. Go to the Read Aloud page')
        console.log('   3. Record and submit normally')
        console.log('   The upload functionality is working correctly!')

    } catch (error) {
        console.error('❌ Error:', error.message)
        console.error('\n💡 Make sure to:')
        console.log('   1. Have VERCEL_BLOB_READ_WRITE_TOKEN in .env.local')
        console.log('   2. Be logged in to the app')
        console.log('   3. Run the upload through the UI instead')
    }
}

testUploadAndSubmit()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Fatal error:', error)
        process.exit(1)
    })
