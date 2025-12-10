import WritingQuestionClient from '@/components/pte/writing/WritingQuestionClient'
// Force dynamic rendering to avoid DB queries during build
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { writingQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'

/**
 * Fetches a single writing question by its id from the database.
 *
 * @param id - The writing question's identifier
 * @returns The writing question record that matches `id`, or `null` if none is found or an error occurs
 */
async function getQuestion(id: string) {
  try {
    const questions = await db
      .select()
      .from(writingQuestions)
      .where(eq(writingQuestions.id, id))
      .limit(1)

    return questions[0] || null
  } catch (error) {
    console.error('Error fetching write essay question:', error)
    return null
  }
}

/**
 * Renders the write-essay question page for the specified question id.
 *
 * Renders a back link, the question title with instructions, and the WritingQuestionClient for the question.
 *
 * @param props - Component props containing `params`.
 * @param props.params - A promise that resolves to an object with an `id` string identifying the question.
 * @returns A React element that displays the question header, instructions, navigation link, and the writing question client for the specified id. Triggers a 404 page if the question is missing or its type is not `write_essay`.
 */
export default async function WriteEssayQuestionPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const question = await getQuestion(params.id)

  if (!question || question.type !== 'write_essay') {
    notFound()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/pte/academic/practice/writing/write-essay"
          className="inline-flex items-center text-sm px-2 py-1 rounded hover:underline"
        >
          <span className="mr-2">←</span>
          Back to Question List
        </Link>
      </div>

      <div className="rounded border p-4">
        <h1 className="text-2xl font-semibold">{question.title}</h1>
        <p className="text-muted-foreground">
          Write a 200-300 word essay on the given topic. Time limit: 20 minutes
        </p>
      </div>

      <div className="space-y-6">
        <WritingQuestionClient
          questionId={params.id}
          questionType="write_essay"
        />
      </div>
    </div>
  )
}