/**
 * Export Questions from PostgreSQL to Strapi-Compatible JSON
 *
 * This script exports all questions from the current PostgreSQL database
 * to JSON files that can be imported into Strapi.
 *
 * Usage:
 *   tsx scripts/export-to-strapi-json.ts [--section=speaking|reading|writing|listening|all]
 *
 * Output:
 *   strapi-export/speaking-questions.json
 *   strapi-export/reading-questions.json
 *   strapi-export/writing-questions.json
 *   strapi-export/listening-questions.json
 *   strapi-export/mock-tests.json (if --include-tests flag)
 */

import { db } from '../lib/db/drizzle'
import {
  speakingQuestions,
  readingQuestions,
  writingQuestions,
  listeningQuestions,
} from '../lib/db/schema'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const OUTPUT_DIR = 'strapi-export'

// Parse command line arguments
const args = process.argv.slice(2)
const sectionArg = args.find((arg) => arg.startsWith('--section='))
const section = sectionArg ? sectionArg.split('=')[1] : 'all'
const includeTests = args.includes('--include-tests')

interface ExportStats {
  section: string
  total: number
  active: number
  inactive: number
  byDifficulty: Record<string, number>
  byType: Record<string, number>
}

/**
 * Transform database question to Strapi format
 */
function transformToStrapiFormat(question: any, section: string) {
  const base = {
    type: question.type,
    title: question.title,
    difficulty: question.difficulty || 'Medium',
    tags: Array.isArray(question.tags) ? question.tags : [],
    isActive: question.isActive ?? true,
    questionNumber: null, // Will be assigned during import
    metadata: {
      sourceId: question.id,
      createdAt: question.createdAt?.toISOString(),
      migratedFrom: 'postgresql',
    },
  }

  // Section-specific fields
  if (section === 'speaking' || section === 'listening') {
    return {
      ...base,
      promptText: question.promptText || '',
      promptMediaUrl: question.promptMediaUrl || null,
      ...(section === 'listening' && {
        transcript: question.transcript || null,
        correctAnswers: question.correctAnswers || {},
        options: question.options || null,
      }),
    }
  }

  if (section === 'reading' || section === 'writing') {
    return {
      ...base,
      promptText: question.promptText || '',
      options: question.options || null,
      answerKey: question.answerKey || {},
      ...(section === 'writing' && {
        wordLimit:
          question.type === 'summarize_written_text'
            ? { min: 5, max: 75 }
            : { min: 200, max: 300 },
      }),
    }
  }

  return base
}

/**
 * Calculate export statistics
 */
function calculateStats(questions: any[], section: string): ExportStats {
  const stats: ExportStats = {
    section,
    total: questions.length,
    active: 0,
    inactive: 0,
    byDifficulty: {},
    byType: {},
  }

  questions.forEach((q) => {
    // Active/Inactive count
    if (q.isActive) stats.active++
    else stats.inactive++

    // By difficulty
    const diff = q.difficulty || 'Medium'
    stats.byDifficulty[diff] = (stats.byDifficulty[diff] || 0) + 1

    // By type
    const type = q.type
    stats.byType[type] = (stats.byType[type] || 0) + 1
  })

  return stats
}

/**
 * Export speaking questions
 */
async function exportSpeakingQuestions() {
  console.log('\n📢 Exporting Speaking Questions...')

  const questions = await db.select().from(speakingQuestions)

  const transformed = questions.map((q) => transformToStrapiFormat(q, 'speaking'))
  const stats = calculateStats(questions, 'speaking')

  // Write to file
  const filename = join(OUTPUT_DIR, 'speaking-questions.json')
  writeFileSync(filename, JSON.stringify(transformed, null, 2))

  console.log(`✅ Exported ${stats.total} speaking questions to ${filename}`)
  console.log(`   Active: ${stats.active}, Inactive: ${stats.inactive}`)
  console.log(`   By Type:`, stats.byType)
  console.log(`   By Difficulty:`, stats.byDifficulty)

  return stats
}

/**
 * Export reading questions
 */
async function exportReadingQuestions() {
  console.log('\n📖 Exporting Reading Questions...')

  const questions = await db.select().from(readingQuestions)

  const transformed = questions.map((q) => transformToStrapiFormat(q, 'reading'))
  const stats = calculateStats(questions, 'reading')

  // Write to file
  const filename = join(OUTPUT_DIR, 'reading-questions.json')
  writeFileSync(filename, JSON.stringify(transformed, null, 2))

  console.log(`✅ Exported ${stats.total} reading questions to ${filename}`)
  console.log(`   Active: ${stats.active}, Inactive: ${stats.inactive}`)
  console.log(`   By Type:`, stats.byType)
  console.log(`   By Difficulty:`, stats.byDifficulty)

  return stats
}

/**
 * Export writing questions
 */
async function exportWritingQuestions() {
  console.log('\n✍️  Exporting Writing Questions...')

  const questions = await db.select().from(writingQuestions)

  const transformed = questions.map((q) => transformToStrapiFormat(q, 'writing'))
  const stats = calculateStats(questions, 'writing')

  // Write to file
  const filename = join(OUTPUT_DIR, 'writing-questions.json')
  writeFileSync(filename, JSON.stringify(transformed, null, 2))

  console.log(`✅ Exported ${stats.total} writing questions to ${filename}`)
  console.log(`   Active: ${stats.active}, Inactive: ${stats.inactive}`)
  console.log(`   By Type:`, stats.byType)
  console.log(`   By Difficulty:`, stats.byDifficulty)

  return stats
}

/**
 * Export listening questions
 */
async function exportListeningQuestions() {
  console.log('\n🎧 Exporting Listening Questions...')

  const questions = await db.select().from(listeningQuestions)

  const transformed = questions.map((q) => transformToStrapiFormat(q, 'listening'))
  const stats = calculateStats(questions, 'listening')

  // Write to file
  const filename = join(OUTPUT_DIR, 'listening-questions.json')
  writeFileSync(filename, JSON.stringify(transformed, null, 2))

  console.log(`✅ Exported ${stats.total} listening questions to ${filename}`)
  console.log(`   Active: ${stats.active}, Inactive: ${stats.inactive}`)
  console.log(`   By Type:`, stats.byType)
  console.log(`   By Difficulty:`, stats.byDifficulty)

  return stats
}

/**
 * Export mock tests (optional)
 */
async function exportMockTests() {
  console.log('\n🎯 Exporting Mock Tests...')

  try {
    // Import mock test schema
    const { mockTests, mockTestQuestions } = await import(
      '../lib/db/schema-mock-tests'
    )

    const tests = await db.select().from(mockTests)

    // For each test, we'll export metadata only
    // Questions will be linked via relations in Strapi
    const transformed = tests.map((test) => ({
      testNumber: test.testNumber,
      title: test.title || `PTE Mock Test #${test.testNumber}`,
      description: test.description || null,
      difficulty: test.difficulty || 'Medium',
      isFree: test.isFree || false,
      duration: test.durationMinutes || 120,
      isActive: test.status === 'published',
      sectionCounts: {},
      metadata: {
        sourceId: test.id,
        createdAt: test.createdAt?.toISOString(),
        migratedFrom: 'postgresql',
      },
      // Note: Question relations will need to be set up manually in Strapi
      // or via a separate import script after questions are imported
    }))

    const filename = join(OUTPUT_DIR, 'mock-tests.json')
    writeFileSync(filename, JSON.stringify(transformed, null, 2))

    console.log(`✅ Exported ${tests.length} mock tests to ${filename}`)
    console.log(
      `   Note: Question relations need to be set up in Strapi after importing questions`
    )

    return { total: tests.length }
  } catch (error) {
    console.warn(
      '⚠️  Mock tests export skipped (schema-mock-tests.ts not found or error)'
    )
    return { total: 0 }
  }
}

/**
 * Main export function
 */
async function main() {
  console.log('🚀 Starting PostgreSQL to Strapi JSON Export')
  console.log(`   Section: ${section}`)
  console.log(`   Include Mock Tests: ${includeTests}`)

  // Create output directory
  try {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  } catch (error) {
    // Directory already exists
  }

  const allStats: ExportStats[] = []

  try {
    // Export based on section argument
    if (section === 'all' || section === 'speaking') {
      const stats = await exportSpeakingQuestions()
      allStats.push(stats)
    }

    if (section === 'all' || section === 'reading') {
      const stats = await exportReadingQuestions()
      allStats.push(stats)
    }

    if (section === 'all' || section === 'writing') {
      const stats = await exportWritingQuestions()
      allStats.push(stats)
    }

    if (section === 'all' || section === 'listening') {
      const stats = await exportListeningQuestions()
      allStats.push(stats)
    }

    // Export mock tests if requested
    if (includeTests) {
      await exportMockTests()
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 EXPORT SUMMARY')
    console.log('='.repeat(60))

    let totalQuestions = 0
    allStats.forEach((stats) => {
      totalQuestions += stats.total
      console.log(`\n${stats.section.toUpperCase()}:`)
      console.log(`  Total: ${stats.total}`)
      console.log(`  Active: ${stats.active}, Inactive: ${stats.inactive}`)
    })

    console.log('\n' + '='.repeat(60))
    console.log(`✅ TOTAL QUESTIONS EXPORTED: ${totalQuestions}`)
    console.log('='.repeat(60))

    console.log('\n📁 Output directory: ' + OUTPUT_DIR)
    console.log('\n📝 Next Steps:')
    console.log('1. Create content types in Strapi admin (see docs/STRAPI_CONTENT_TYPES.md)')
    console.log('2. Install @strapi/plugin-import-export-entries in Strapi')
    console.log('3. Import JSON files via Strapi admin UI')
    console.log('4. Verify data and test API endpoints')
    console.log('5. Update Next.js to use Strapi API\n')
  } catch (error) {
    console.error('❌ Export failed:', error)
    process.exit(1)
  }
}

// Run the export
main()
