import { AcademicPracticeHeader } from '@/components/pte/practice-header'
// Force dynamic rendering to avoid DB queries during build
export const dynamic = 'force-dynamic'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { db } from '@/lib/db'
import { pteCategories } from '@/lib/db/schema'
import { initialCategories } from '@/lib/pte/data'
import Link from 'next/link'
import { notFound } from 'next/navigation'

/**
 * Retrieve category records from the database with a fallback to `initialCategories`.
 *
 * If the `pteCategories` table contains any records, those records are returned; otherwise `initialCategories` is returned.
 *
 * @returns An array of category records from the `pteCategories` table when available, otherwise `initialCategories`.
 */
async function getCategories() {
  try {
    const categories = await db.select().from(pteCategories)
    if (categories.length > 0) {
      return categories
    }
    return initialCategories
  } catch (error) {
    console.error('Failed to fetch categories from DB, using fallback:', error)
    return initialCategories
  }
}

type SectionKey = 'speaking' | 'writing' | 'reading' | 'listening'

const SECTION_META: Record<SectionKey, { id: number; label: string }> = {
  speaking: { id: 1, label: 'Speaking' },
  writing: { id: 7, label: 'Writing' },
  reading: { id: 10, label: 'Reading' },
  listening: { id: 16, label: 'Listening' },
}

/**
 * Render the PTE section landing page with a header and a grid of category cards.
 *
 * The component resolves the incoming route `section` parameter, validates it (must be
 * "speaking", "writing", "reading", or "listening"), loads categories, and renders cards
 * that link to each category's practice page.
 *
 * @param props - Component props containing route parameters.
 * @param props.params - A promise resolving to an object with a `section` string; the value is normalized to lowercase and validated.
 * @returns A React element containing the section header and a responsive grid of category cards linking to practice pages.
 *
 * Note: Invokes `notFound()` when the `section` parameter is invalid.
 */
export default async function SectionLandingPage(props: {
  params: Promise<{ section: string }>
}) {
  const params = await props.params
  const sectionParam = (params.section ?? '').toLowerCase() as SectionKey

  if (!['speaking', 'writing', 'reading', 'listening'].includes(sectionParam)) {
    notFound()
  }

  const categories = await getCategories()
  const parentId = SECTION_META[sectionParam].id

  const items = categories.filter((c) => c.parent === parentId)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <AcademicPracticeHeader section={sectionParam} showFilters={false} />

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((q) => {
            let href = `/pte/academic/practice/${sectionParam}/${q.code}`

            // Special routes for dedicated pages
            if (sectionParam === 'speaking' && q.code === 's_read_aloud') {
              href = '/pte/academic/practice/speaking/read-aloud'
            } else if (sectionParam === 'writing' && q.code === 'w_summarize_text') {
              href = '/pte/academic/practice/writing/summarize-written-text'
            } else if (sectionParam === 'writing' && q.code === 'w_essay') {
              href = '/pte/academic/practice/writing/write-essay'
            } else if (sectionParam === 'reading' && q.code === 'rw_fib') {
              href = '/pte/academic/practice/reading/reading-writing-fill-blanks'
            } else if (sectionParam === 'reading' && q.code === 'r_mcq_multiple') {
              href = '/pte/academic/practice/reading/multiple-choice-multiple'
            } else if (sectionParam === 'reading' && q.code === 'r_reorder_paragraphs') {
              href = '/pte/academic/practice/reading/reorder-paragraphs'
            } else if (sectionParam === 'reading' && q.code === 'r_fib') {
              href = '/pte/academic/practice/reading/fill-in-blanks'
            } else if (sectionParam === 'reading' && q.code === 'r_mcq_single') {
              href = '/pte/academic/practice/reading/multiple-choice-single'
            }

            return (
              <Link key={q.id} href={href} className="block">
                <Card className="cursor-pointer transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 rounded-lg bg-gray-50 p-2 dark:bg-gray-800">

                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold dark:text-gray-100">{q.title}</h3>
                          {q.scoring_type === 'ai' && (
                            <Badge className="bg-yellow-500 text-xs text-yellow-900 dark:bg-yellow-600 dark:text-yellow-100">
                              AI
                            </Badge>
                          )}
                          {q.short_name && (
                            <Badge variant="secondary" className="text-xs">
                              {q.short_name}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                          {q.description}
                        </p>
                        <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                          {q.question_count} questions
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}