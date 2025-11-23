import { Suspense } from 'react'
import Link from 'next/link'
import { CommunityBoard, CommunityBoardSkeleton } from '@/components/pte/community/community-board'
import { AcademicPracticeHeader } from '@/components/pte/practice-header'
import { getAllAttempts, getCommunityStats, SpeakingType } from '@/lib/actions/community'

export const metadata = {
  title: 'Community - Pedagogists PTE',
  description: 'Listen to speaking attempts from the community',
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: { page?: string; type?: string; sort?: string }
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const type = params.type as SpeakingType | undefined
  const sortBy = (params.sort || 'recent') as 'recent' | 'top_score'

  const [attemptsData, stats] = await Promise.all([
    getAllAttempts({ page, type, sortBy, limit: 20 }),
    getCommunityStats(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <AcademicPracticeHeader section="speaking" showFilters={false} />

        {/* Breadcrumbs */}
        <nav className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/pte" className="hover:text-primary">
            PTE
          </Link>
          <span>/</span>
          <Link href="/pte/academic/practice" className="hover:text-primary">
            Practice
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Community</span>
        </nav>

        {/* Page Title */}
        <div className="mt-6 space-y-2">
          <h1 className="text-3xl font-bold">Community Board</h1>
          <p className="text-muted-foreground">
            Listen to speaking attempts from other learners and improve your skills
          </p>
        </div>

        {/* Board */}
        <div className="mt-8">
          <Suspense fallback={<CommunityBoardSkeleton />}>
            <CommunityBoard initialData={attemptsData} stats={stats} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
