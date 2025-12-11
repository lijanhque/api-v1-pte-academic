'use client'

import {
  ColumnDef,
  FilterConfig,
  BulkAction,
  createIndexColumn,
  createTitleColumn,
  createDifficultyColumn,
  createStatusColumn,
  createPracticeCountColumn,
  createBookmarkColumn,
  createActionsColumn,
} from './universal-data-table'
import { Badge } from '@/components/ui/badge'
import { Volume2, FileText, Headphones, PenTool } from 'lucide-react'

// ============ Base Question Type ============

export interface BaseQuestion {
  id: string
  title?: string | null
  difficulty?: 'Easy' | 'Medium' | 'Hard' | string | null
  practiceCount?: number
  practicedCount?: number
  bookmarked?: boolean
  tags?: string[] | null
  isActive?: boolean | null
  createdAt?: Date | null
}

// ============ Section-Specific Types ============

export interface SpeakingQuestion extends BaseQuestion {
  type?: string | null
  promptText?: string | null
  promptMediaUrl?: string | null
  audioUrl?: string | null
}

export interface ReadingQuestion extends BaseQuestion {
  type?: string | null
  promptText?: string | null
  options?: unknown
  answerKey?: unknown
}

export interface WritingQuestion extends BaseQuestion {
  type?: string | null
  promptText?: string | null
  options?: unknown
  answerKey?: unknown
}

export interface ListeningQuestion extends BaseQuestion {
  type?: string | null
  promptText?: string | null
  promptMediaUrl?: string | null
  audioUrl?: string | null
  transcript?: string | null
}

// ============ Question Type Mapping ============

export type PTESection = 'speaking' | 'reading' | 'writing' | 'listening'

export const QUESTION_TYPE_SLUGS: Record<string, string> = {
  // Speaking
  'read_aloud': 'read-aloud',
  'repeat_sentence': 'repeat-sentence',
  'describe_image': 'describe-image',
  'retell_lecture': 'retell-lecture',
  'answer_short_question': 'answer-short-question',
  'summarize_group_discussion': 'summarize-group-discussion',
  'respond_to_a_situation': 'respond-to-situation',
  // Reading
  'reading_fill_blanks': 'fill-in-blanks',
  'reading_writing_fill_blanks': 'reading-writing-fill-blanks',
  'multiple_choice_single': 'multiple-choice-single',
  'multiple_choice_multiple': 'multiple-choice-multiple',
  'reorder_paragraphs': 'reorder-paragraphs',
  // Writing
  'summarize_written_text': 'summarize-written-text',
  'write_essay': 'write-essay',
  // Listening
  'summarize_spoken_text': 'summarize-spoken-text',
  'listening_multiple_choice_multiple': 'multiple-choice-multiple',
  'listening_multiple_choice_single': 'multiple-choice-single',
  'listening_fill_blanks': 'fill-in-blanks',
  'highlight_correct_summary': 'highlight-correct-summary',
  'select_missing_word': 'select-missing-word',
  'highlight_incorrect_words': 'highlight-incorrect-words',
  'write_from_dictation': 'write-from-dictation',
}

// ============ Difficulty Filter ============

export const DIFFICULTY_FILTER: FilterConfig = {
  key: 'difficulty',
  label: 'Difficulty',
  options: [
    { label: 'Easy', value: 'Easy' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Hard', value: 'Hard' },
  ],
}

// ============ Status Filter ============

export const STATUS_FILTER: FilterConfig = {
  key: 'practiced',
  label: 'Status',
  options: [
    { label: 'Practiced', value: 'practiced' },
    { label: 'Not Practiced', value: 'not_practiced' },
  ],
}

// ============ Column Presets ============

export function createQuestionColumns<T extends BaseQuestion>(
  section: PTESection,
  questionType: string,
  options?: {
    onBookmarkToggle?: (row: T) => void
    onDelete?: (row: T) => void
    showIndex?: boolean
    showPracticeCount?: boolean
    showBookmark?: boolean
    showActions?: boolean
    maxTitleLength?: number
  }
): ColumnDef<T>[] {
  const {
    onBookmarkToggle,
    onDelete,
    showIndex = true,
    showPracticeCount = true,
    showBookmark = true,
    showActions = true,
    maxTitleLength = 80,
  } = options || {}

  const typeSlug = QUESTION_TYPE_SLUGS[questionType] || questionType

  const columns: ColumnDef<T>[] = []

  if (showIndex) {
    columns.push(createIndexColumn<T>())
  }

  columns.push(
    createTitleColumn<T>({
      href: (row) => `/pte/academic/practice/${section}/${typeSlug}/question/${row.id}`,
      maxLength: maxTitleLength,
    })
  )

  columns.push(createDifficultyColumn<T>())
  columns.push(createStatusColumn<T>())

  if (showPracticeCount) {
    columns.push(createPracticeCountColumn<T>())
  }

  if (showBookmark) {
    columns.push(createBookmarkColumn<T>(onBookmarkToggle))
  }

  if (showActions) {
    columns.push(
      createActionsColumn<T>({
        practiceHref: (row) => `/pte/academic/practice/${section}/${typeSlug}/question/${row.id}`,
        onDelete,
      })
    )
  }

  return columns
}

// ============ Section-Specific Presets ============

export function createSpeakingQuestionColumns(
  questionType: string,
  options?: {
    onBookmarkToggle?: (row: SpeakingQuestion) => void
    onDelete?: (row: SpeakingQuestion) => void
  }
): ColumnDef<SpeakingQuestion>[] {
  return createQuestionColumns<SpeakingQuestion>('speaking', questionType, options)
}

export function createReadingQuestionColumns(
  questionType: string,
  options?: {
    onBookmarkToggle?: (row: ReadingQuestion) => void
    onDelete?: (row: ReadingQuestion) => void
  }
): ColumnDef<ReadingQuestion>[] {
  return createQuestionColumns<ReadingQuestion>('reading', questionType, options)
}

export function createWritingQuestionColumns(
  questionType: string,
  options?: {
    onBookmarkToggle?: (row: WritingQuestion) => void
    onDelete?: (row: WritingQuestion) => void
  }
): ColumnDef<WritingQuestion>[] {
  return createQuestionColumns<WritingQuestion>('writing', questionType, options)
}

export function createListeningQuestionColumns(
  questionType: string,
  options?: {
    onBookmarkToggle?: (row: ListeningQuestion) => void
    onDelete?: (row: ListeningQuestion) => void
  }
): ColumnDef<ListeningQuestion>[] {
  return createQuestionColumns<ListeningQuestion>('listening', questionType, options)
}

// ============ Bulk Actions ============

export function createBulkDeleteAction<T extends BaseQuestion>(
  onDelete: (items: T[]) => void | Promise<void>
): BulkAction<T> {
  return {
    id: 'delete',
    label: 'Delete',
    variant: 'destructive',
    onClick: onDelete,
  }
}

export function createBulkBookmarkAction<T extends BaseQuestion>(
  onBookmark: (items: T[]) => void | Promise<void>
): BulkAction<T> {
  return {
    id: 'bookmark',
    label: 'Bookmark',
    onClick: onBookmark,
  }
}

// ============ Section Icon Component ============

export function SectionIcon({ section, className }: { section: PTESection; className?: string }) {
  switch (section) {
    case 'speaking':
      return <Volume2 className={className} />
    case 'reading':
      return <FileText className={className} />
    case 'writing':
      return <PenTool className={className} />
    case 'listening':
      return <Headphones className={className} />
    default:
      return null
  }
}

// ============ Section Badge Component ============

export function SectionBadge({ section }: { section: PTESection }) {
  const colors: Record<PTESection, string> = {
    speaking: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    reading: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    writing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    listening: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  }

  return (
    <Badge variant="outline" className={`border-0 ${colors[section]}`}>
      <SectionIcon section={section} className="mr-1 h-3 w-3" />
      {section.charAt(0).toUpperCase() + section.slice(1)}
    </Badge>
  )
}

// ============ Quick Table Factory ============

interface QuickTableConfig<T extends BaseQuestion> {
  section: PTESection
  questionType: string
  data: T[]
  onBookmarkToggle?: (row: T) => void
  onDelete?: (row: T) => void
  onBulkDelete?: (rows: T[]) => void
}

export function getQuickTableProps<T extends BaseQuestion>({
  section,
  questionType,
  data,
  onBookmarkToggle,
  onDelete,
  onBulkDelete,
}: QuickTableConfig<T>) {
  return {
    data,
    columns: createQuestionColumns<T>(section, questionType, {
      onBookmarkToggle,
      onDelete,
    }),
    searchable: true,
    searchPlaceholder: 'Search questions...',
    searchKeys: ['title'] as (keyof T)[],
    filters: [DIFFICULTY_FILTER],
    selectable: !!onBulkDelete,
    bulkActions: onBulkDelete ? [createBulkDeleteAction<T>(onBulkDelete)] : [],
    pageSize: 10,
  }
}
