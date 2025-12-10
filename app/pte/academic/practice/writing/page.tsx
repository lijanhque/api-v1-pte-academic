import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// Force dynamic rendering to avoid DB queries during build
export const dynamic = 'force-dynamic'
import { getQuestionCounts } from '@/lib/pte/direct-queries'
import { PenTool, FileText } from 'lucide-react'
import Link from 'next/link'

/**
 * Fetches question counts for the "writing" category.
 *
 * @returns An object mapping count keys to numbers for writing questions; returns an empty object if fetching fails.
 */
async function getWritingCounts() {
  try {
    const counts = await getQuestionCounts('writing')
    return counts
  } catch (error) {
    console.error('Error fetching writing question counts:', error)
    return {}
  }
}

/**
 * Render the Writing Practice page showing clickable cards for writing practice categories with their available question counts.
 *
 * The page displays two categories ("Summarize Written Text" and "Write Essay"), each showing an icon, brief description, and the number of available questions fetched from the backend.
 *
 * @returns The React element tree for the Writing Practice page.
 */
export default async function WritingPracticePage() {
  const counts = await getWritingCounts()

  const categories = [
    {
      id: 'summarize-written-text',
      title: 'Summarize Written Text',
      description: 'Read a passage and write a one-sentence summary (5-75 words)',
      icon: FileText,
      count: counts['summarize_written_text'] || 0,
      href: '/pte/academic/practice/writing/summarize-written-text',
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      id: 'write-essay',
      title: 'Write Essay',
      description: 'Write a 200-300 word essay on a given topic within 20 minutes',
      icon: PenTool,
      count: counts['write_essay'] || 0,
      href: '/pte/academic/practice/writing/write-essay',
      color: 'bg-purple-500/10 text-purple-500',
    },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Writing Practice</h1>
        <p className="text-muted-foreground">
          Practice your writing skills with summarization and essay tasks
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Link key={category.id} href={category.href}>
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${category.color}`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {category.count} questions available
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}