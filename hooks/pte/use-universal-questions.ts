'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { PTESection, BaseQuestion } from '@/components/pte/universal'

// ============ Types ============

export interface UseUniversalQuestionsOptions<T extends BaseQuestion> {
  section: PTESection
  questionType: string
  initialData?: T[]
  fetchFn?: () => Promise<T[]>
  deleteFn?: (ids: string[]) => Promise<void>
  bookmarkFn?: (id: string, bookmarked: boolean) => Promise<void>
}

export interface UseUniversalQuestionsReturn<T extends BaseQuestion> {
  questions: T[]
  loading: boolean
  error: Error | null
  // Actions
  refresh: () => Promise<void>
  deleteQuestions: (ids: string[]) => Promise<void>
  toggleBookmark: (id: string) => Promise<void>
  // Navigation
  navigateToQuestion: (id: string) => void
  // Computed
  totalCount: number
  practicedCount: number
  bookmarkedCount: number
}

// ============ Hook ============

export function useUniversalQuestions<T extends BaseQuestion>({
  section,
  questionType,
  initialData = [],
  fetchFn,
  deleteFn,
  bookmarkFn,
}: UseUniversalQuestionsOptions<T>): UseUniversalQuestionsReturn<T> {
  const router = useRouter()
  const [questions, setQuestions] = useState<T[]>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Fetch questions
  const refresh = useCallback(async () => {
    if (!fetchFn) return

    setLoading(true)
    setError(null)

    try {
      const data = await fetchFn()
      setQuestions(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch questions'))
    } finally {
      setLoading(false)
    }
  }, [fetchFn])

  // Delete questions
  const deleteQuestions = useCallback(async (ids: string[]) => {
    if (!deleteFn) {
      console.warn('Delete function not provided')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await deleteFn(ids)
      setQuestions((prev) => prev.filter((q) => !ids.includes(q.id)))
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete questions'))
      throw err
    } finally {
      setLoading(false)
    }
  }, [deleteFn])

  // Toggle bookmark
  const toggleBookmark = useCallback(async (id: string) => {
    const question = questions.find((q) => q.id === id)
    if (!question) return

    const newBookmarked = !question.bookmarked

    // Optimistic update
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, bookmarked: newBookmarked } : q
      )
    )

    if (bookmarkFn) {
      try {
        await bookmarkFn(id, newBookmarked)
      } catch (err) {
        // Revert on error
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === id ? { ...q, bookmarked: !newBookmarked } : q
          )
        )
        throw err
      }
    }
  }, [questions, bookmarkFn])

  // Navigate to question
  const navigateToQuestion = useCallback((id: string) => {
    router.push(`/pte/academic/practice/${section}/${questionType}/question/${id}`)
  }, [router, section, questionType])

  // Computed values
  const totalCount = questions.length
  const practicedCount = useMemo(
    () => questions.filter((q) => (q.practiceCount ?? q.practicedCount ?? 0) > 0).length,
    [questions]
  )
  const bookmarkedCount = useMemo(
    () => questions.filter((q) => q.bookmarked).length,
    [questions]
  )

  return {
    questions,
    loading,
    error,
    refresh,
    deleteQuestions,
    toggleBookmark,
    navigateToQuestion,
    totalCount,
    practicedCount,
    bookmarkedCount,
  }
}

// ============ Server Action Wrapper ============

export function createQuestionActions<T extends BaseQuestion>(
  section: PTESection,
  questionType: string
) {
  return {
    async fetchQuestions(): Promise<T[]> {
      const response = await fetch(`/api/pte/${section}/${questionType}`)
      if (!response.ok) throw new Error('Failed to fetch questions')
      return response.json()
    },

    async deleteQuestions(ids: string[]): Promise<void> {
      const response = await fetch(`/api/pte/${section}/${questionType}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      if (!response.ok) throw new Error('Failed to delete questions')
    },

    async toggleBookmark(id: string, bookmarked: boolean): Promise<void> {
      const response = await fetch(`/api/pte/${section}/${questionType}/${id}/bookmark`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmarked }),
      })
      if (!response.ok) throw new Error('Failed to update bookmark')
    },
  }
}
