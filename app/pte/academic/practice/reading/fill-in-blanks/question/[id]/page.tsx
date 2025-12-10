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
 * @param id - The reading question's unique identifier.
 * @returns The question record if found; `null` if no matching question exists or an error occurs.
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
    console.error('Error fetching Fill in Blanks question:', error)
    return null
  }
}

/**
 * Server component that displays the fill-in-blanks reading question page for a given question ID.
 *
 * Fetches the question by ID, shows the question title, instructions, a back link, and embeds the client-side
 * ReadingQuestionClient configured for `fill_in_blanks`. If the question does not exist or its type is not
 * `fill_in_blanks`, the function invokes `notFound()` to render a 404 page.
 *
 * @param props - An object with `params`, a Promise that resolves to route parameters containing `id`.
 * @returns A React element rendering the question page (title, instructions, navigation, and client-side UI); triggers a 404 page when the question is missing or not of type `fill_in_blanks`.
 */
export default async function FillInBlanksQuestionPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const question = await getQuestion(params.id)

  if (!question || question.type !== 'fill_in_blanks') {
    notFound()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/pte/academic/practice/reading/fill-in-blanks"
          className="inline-flex items-center text-sm px-2 py-1 rounded hover:underline"
        >
          <span className="mr-2">←</span>
          Back to Question List
        </Link>
      </div>

      <div className="rounded border p-4">
        <h1 className="text-2xl font-semibold">{question.title}</h1>
        <p className="text-muted-foreground">
          Drag and drop the words to fill in the blanks in the reading passage
        </p>
      </div>

      <div className="space-y-6">
        <ReadingQuestionClient
          questionId={params.id}
          questionType="fill_in_blanks"
        />
      </div>
    </div>
  )
}