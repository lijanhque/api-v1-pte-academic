'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  UniversalDataTable,
  UniversalDataTableSkeleton,
  createQuestionColumns,
  DIFFICULTY_FILTER,
  type PTESection,
  type BaseQuestion,
} from './index'

// ============ Types ============

export interface QuestionListPageProps<T extends BaseQuestion> {
  // Section info
  section: PTESection
  questionType: string
  questionTypeSlug: string
  // Display
  title: string
  description: string
  icon: React.ReactNode
  // Data
  questions: T[]
  // Tabs
  weeklyQuestions?: T[]
  monthlyQuestions?: T[]
  currentMonthName?: string
  // Features
  showTabs?: boolean
  searchable?: boolean
  filterable?: boolean
  selectable?: boolean
  // Callbacks
  onBookmarkToggle?: (question: T) => void | Promise<void>
  onDelete?: (questions: T[]) => void | Promise<void>
}

// ============ Component ============

export function QuestionListPage<T extends BaseQuestion>({
  section,
  questionType,
  questionTypeSlug,
  title,
  description,
  icon,
  questions,
  weeklyQuestions,
  monthlyQuestions,
  currentMonthName = 'Monthly',
  showTabs = false,
  searchable = true,
  filterable = true,
  selectable = false,
  onBookmarkToggle,
  onDelete,
}: QuestionListPageProps<T>) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Handle bookmark toggle with optimistic update
  const handleBookmarkToggle = useCallback(async (question: T) => {
    if (!onBookmarkToggle) return

    try {
      await onBookmarkToggle(question)
      toast.success(question.bookmarked ? 'Removed from bookmarks' : 'Added to bookmarks')
    } catch {
      toast.error('Failed to update bookmark')
    }
  }, [onBookmarkToggle])

  // Handle bulk delete
  const handleBulkDelete = useCallback(async (selectedQuestions: T[]) => {
    if (!onDelete) return

    setLoading(true)
    try {
      await onDelete(selectedQuestions)
      toast.success(`Deleted ${selectedQuestions.length} question(s)`)
      router.refresh()
    } catch {
      toast.error('Failed to delete questions')
    } finally {
      setLoading(false)
    }
  }, [onDelete, router])

  // Create columns
  const columns = createQuestionColumns<T>(section, questionType, {
    onBookmarkToggle: onBookmarkToggle ? handleBookmarkToggle : undefined,
    showIndex: true,
    showPracticeCount: true,
    showBookmark: !!onBookmarkToggle,
    showActions: true,
  })

  // Table props
  const tableProps = {
    columns,
    searchable,
    searchPlaceholder: 'Search questions...',
    searchKeys: ['title' as keyof T],
    filters: filterable ? [DIFFICULTY_FILTER] : [],
    selectable,
    bulkActions: selectable && onDelete
      ? [{
          id: 'delete',
          label: 'Delete Selected',
          variant: 'destructive' as const,
          onClick: handleBulkDelete,
        }]
      : [],
    pageSize: 10,
    loading,
  }

  // Render table content
  const renderTable = (data: T[]) => (
    <UniversalDataTable<T>
      data={data}
      {...tableProps}
      emptyState={
        <div className="flex flex-col items-center justify-center py-12">
          <div className="p-4 rounded-full bg-muted mb-4">
            {icon}
          </div>
          <p className="text-lg font-medium text-muted-foreground">
            No questions available
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Questions will appear here once they are added
          </p>
        </div>
      }
    />
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10 shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight truncate">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Available Questions ({questions.length})</CardTitle>
          <CardDescription>
            Select a question to start practicing. Your progress will be saved automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showTabs && weeklyQuestions && monthlyQuestions ? (
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Questions</TabsTrigger>
                <TabsTrigger value="weekly">Weekly Prediction</TabsTrigger>
                <TabsTrigger value="monthly">{currentMonthName} Prediction</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {renderTable(questions)}
              </TabsContent>
              <TabsContent value="weekly">
                {renderTable(weeklyQuestions)}
              </TabsContent>
              <TabsContent value="monthly">
                {renderTable(monthlyQuestions)}
              </TabsContent>
            </Tabs>
          ) : (
            renderTable(questions)
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============ Loading State ============

export function QuestionListPageSkeleton({
  icon,
  title,
}: {
  icon: React.ReactNode
  title: string
}) {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          {icon}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <div className="h-5 w-64 bg-muted animate-pulse rounded mt-2" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent>
          <UniversalDataTableSkeleton columns={5} />
        </CardContent>
      </Card>
    </div>
  )
}
