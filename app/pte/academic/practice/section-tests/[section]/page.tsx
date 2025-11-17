import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AcademicPracticeHeader } from '@/components/pte/practice-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { initialCategories } from '@/lib/pte/data'

export default async function SectionPage(props: {
  params: Promise<{ section: string }>
}) {
  const params = await props.params
  const { section } = params

  const parentCategory = initialCategories.find(
    (cat) => cat.code === section && cat.parent === null
  )

  if (!parentCategory) {
    notFound()
  }

  const childCategories = initialCategories.filter(
    (cat) => cat.parent === parentCategory.id
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <AcademicPracticeHeader section={section} />

        <div className="mt-6">
          <div className="mb-6">
            <div className="mb-4 flex items-center gap-4">
              <Image
                src={parentCategory.icon}
                alt={parentCategory.title}
                width={48}
                height={48}
              />
              <div>
                <h1 className="text-2xl font-bold dark:text-gray-100">{parentCategory.title}</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Choose from {childCategories.length} question types
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {childCategories.map((child) => (
              <Card
                key={child.id}
                className="transition-shadow hover:shadow-md"
              >
                <CardContent className="flex h-full flex-col p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <Image
                      src={child.icon}
                      alt={child.title}
                      width={32}
                      height={32}
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold dark:text-gray-100">{child.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {child.question_count} questions available
                      </p>
                    </div>
                  </div>

                  <p className="mb-4 flex-grow text-sm text-gray-600 dark:text-gray-400">
                    {child.description}
                  </p>

                  <div className="mt-auto">
                    <Button asChild className="w-full">
                      <Link
                        href={`/pte/academic/practice/section-tests/${section}/${child.code}`}
                      >
                        Start Practicing
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  const parentCategories = initialCategories.filter(
    (cat) => cat.parent === null
  )

  return parentCategories.map((category) => ({
    section: category.code,
  }))
}
