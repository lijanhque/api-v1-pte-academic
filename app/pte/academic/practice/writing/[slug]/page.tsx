import { QuestionListTable } from '@/components/pte/question-list-table'
// Force dynamic rendering to avoid DB queries during build
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getQuestionsDirectly } from '@/lib/pte/direct-queries'
import { PenTool, FileText } from 'lucide-react'
import { notFound } from 'next/navigation'

// Map slug to database question type
const SLUG_TO_TYPE_MAP: Record<string, { type: string; title: string; description: string; icon: any }> = {
  'summarize-written-text': {
    type: 'summarize_written_text',
    title: 'Summarize Written Text',
    description: 'Read a passage and write a one-sentence summary (5-75 words)',
    icon: FileText,
  },
  'write-essay': {
    type: 'write_essay',
    title: 'Write Essay',
    description: 'Write a 200-300 word essay on a given topic within 20 minutes',
    icon: PenTool,
  },
}

/**
 * Fetches and normalizes writing questions for a given question type.
 *
 * @param questionType - The question type identifier to fetch (e.g., "summarize_written_text")
 * @returns An array of questions where each item contains:
 * - `id`: question identifier
 * - `title`: question title
 * - `difficulty`: difficulty level (defaults to "Medium" if missing)
 * - `bookmarked`: bookmark state (defaults to `false` if missing)
 * - `practiceCount`: number of practice attempts (currently always `0`)
 *
 * Returns an empty array if fetching fails.
 */
async function getWritingQuestions(questionType: string) {
  try {
    const result = await getQuestionsDirectly('writing', questionType, {
      page: 1,
      pageSize: 100,
      isActive: true,
    })

    return result.items.map(q => ({
      id: q.id,
      title: q.title,
      difficulty: q.difficulty || 'Medium',
      bookmarked: q.bookmarked || false,
      practiceCount: 0, // TODO: Add practice count tracking if needed
    }))
  } catch (error) {
    console.error('Error fetching writing questions:', error)
    return []
  }
}

/**
 * Renders the writing category page for the given route slug.
 *
 * @param props - Component props containing route parameters.
 * @param props.params - A promise that resolves to an object with a `slug` route parameter identifying the writing category.
 * @returns The page element that displays the category header (icon, title, description) and a table of available questions for that category.
 */
export default async function WritingCategoryPage(props: {
  params: Promise<{ slug: string }>
}) {
  const params = await props.params
  const config = SLUG_TO_TYPE_MAP[params.slug]

  if (!config) {
    notFound()
  }

  const questions = await getWritingQuestions(config.type)
  const Icon = config.icon

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Questions ({questions.length})</CardTitle>
          <CardDescription>
            Select a question to start practicing. Your progress will be saved automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionListTable
            questions={questions}
            basePath="/pte/academic/practice/writing"
            sectionType={params.slug}
          />
        </CardContent>
      </Card>
    </div>
  )
}