import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getQuestionCounts } from '@/lib/pte/direct-queries'
import { FileText, CheckSquare, ListOrdered, TextCursor, Circle } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering to avoid DB queries during build
export const dynamic = 'force-dynamic'

/**
 * Fetches question counts for the "reading" category.
 *
 * @returns An object mapping reading-related question types to their counts, or an empty object if the fetch fails.
 */
async function getReadingCounts() {
  try {
    const counts = await getQuestionCounts('reading')
    return counts
  } catch (error) {
    console.error('Error fetching reading question counts:', error)
    return {}
  }
}

/**
 * Render the Reading Practice hub page displaying available reading practice categories.
 *
 * Shows a responsive grid of category cards; each card includes an icon, title, short name badge,
 * description, and the number of questions available, and links to the corresponding practice route.
 *
 * @returns The React element for the Reading Practice page containing the category cards grid.
 */
export default async function ReadingPracticePage() {
  const counts = await getReadingCounts()

  const categories = [
    {
      id: 'reading-writing-fill-blanks',
      title: 'Reading & Writing: Fill in the Blanks',
      description: 'Fill in the blanks with the most appropriate words from the dropdown options',
      icon: FileText,
      count: counts['reading_writing_fill_blanks'] || 0,
      href: '/pte/academic/practice/reading/reading-writing-fill-blanks',
      color: 'bg-blue-500/10 text-blue-500',
      shortName: 'RW-FIB',
    },
    {
      id: 'multiple-choice-multiple',
      title: 'Multiple Choice (Multiple Answers)',
      description: 'Read the text and select all correct answers from the options',
      icon: CheckSquare,
      count: counts['multiple_choice_multiple'] || 0,
      href: '/pte/academic/practice/reading/multiple-choice-multiple',
      color: 'bg-cyan-500/10 text-cyan-500',
      shortName: 'MCM',
    },
    {
      id: 'reorder-paragraphs',
      title: 'Re-order Paragraphs',
      description: 'Drag and drop paragraphs to arrange them in the correct logical order',
      icon: ListOrdered,
      count: counts['reorder_paragraphs'] || 0,
      href: '/pte/academic/practice/reading/reorder-paragraphs',
      color: 'bg-teal-500/10 text-teal-500',
      shortName: 'RO',
    },
    {
      id: 'fill-in-blanks',
      title: 'Reading: Fill in the Blanks',
      description: 'Drag and drop words to fill in the blanks in the reading passage',
      icon: TextCursor,
      count: counts['fill_in_blanks'] || 0,
      href: '/pte/academic/practice/reading/fill-in-blanks',
      color: 'bg-emerald-500/10 text-emerald-500',
      shortName: 'R-FIB',
    },
    {
      id: 'multiple-choice-single',
      title: 'Multiple Choice (Single Answer)',
      description: 'Read the text and select the single best answer from the options',
      icon: Circle,
      count: counts['multiple_choice_single'] || 0,
      href: '/pte/academic/practice/reading/multiple-choice-single',
      color: 'bg-green-500/10 text-green-500',
      shortName: 'MCS',
    },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Reading Practice</h1>
        <p className="text-muted-foreground">
          Practice your reading comprehension and analysis skills with various question types
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Link key={category.id} href={category.href}>
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 h-full">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${category.color}`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                          {category.shortName}
                        </span>
                      </div>
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