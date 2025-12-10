import ReadingQuestionClient from '@/components/pte/reading/ReadingQuestionClient'
// Force dynamic rendering to avoid DB queries during build
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { readingQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'

/**
 * Fetches a reading question by its ID from the database.
 *
 * @param id - The ID of the reading question to retrieve.
 * @returns The reading question record matching `id`, or `null` if no record is found or an error occurs.
 */
async function getQuestion(id: string) {
  try {
    const questions = await db
      .select()
      .from(readingQuestions)
      .where(eq(readingQuestions.id, id))
      .limit(1)

    return questions[0] || null
  } catch (error) {
    console.error('Error fetching Reorder Paragraphs question:', error)
    return null
  }
}

/**
 * Server page that renders the Reorder Paragraphs reading question identified by route params.
 *
 * Fetches the question by `id` from `props.params`, displays the question title and instructions,
 * provides a back link to the question list, and mounts the client component that handles
 * the reorder-paragraphs interaction.
 *
 * If the question is missing or its `type` is not `"reorder_paragraphs"`, this page invokes
 * `notFound()` to render a 404.
 *
 * @param props - An object whose `params` property is a promise resolving to `{ id: string }`
 * @returns The page UI for the specified Reorder Paragraphs question
 */
export default async function ReorderParagraphsQuestionPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const question = await getQuestion(params.id)

  if (!question || question.type !== 'reorder_paragraphs') {
    notFound()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/pte/academic/practice/reading/reorder-paragraphs"
          className="inline-flex items-center text-sm px-2 py-1 rounded hover:underline"
        >
          <span className="mr-2">←</span>
          Back to Question List
        </Link>
      </div>

      <div className="rounded border p-4">
        <h1 className="text-2xl font-semibold">{question.title}</h1>
        <p className="text-muted-foreground">
          Arrange the paragraphs in the correct logical order using the arrow buttons
        </p>
      </div>

      <div className="space-y-6">
        <ReadingQuestionClient
          questionId={params.id}
          questionType="reorder_paragraphs"
        />
      </div>
    </div>
  )
}