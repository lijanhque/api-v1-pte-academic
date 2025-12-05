'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import { PlayCircle, BookmarkIcon } from 'lucide-react'

type Question = {
  id: string
  title: string
  difficulty?: string
  bookmarked?: boolean
  practiceCount?: number
}

type QuestionListTableProps = {
  questions: Question[]
  basePath: string
  sectionType: string
}

/**
 * Render a table of questions with per-row difficulty and status badges and a "Practice" action.
 *
 * Renders a centered "No questions available at the moment." message when `questions` is empty.
 *
 * @param questions - Array of question objects; each must include `id` and `title` and may include `difficulty`, `bookmarked`, and `practiceCount`.
 * @param basePath - Base URL segment used to build each question's practice link.
 * @param sectionType - Section segment appended to `basePath` when building each question's practice link.
 * @returns A table listing each question with index, title (with optional bookmark icon), difficulty badge, practice count, status badge, and a right-aligned "Practice" button linking to the question's practice page; if `questions` is empty, the centered empty-state message is returned.
 */
export function QuestionListTable({ questions, basePath, sectionType }: QuestionListTableProps) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No questions available at the moment.
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">#</TableHead>
            <TableHead>Question</TableHead>
            <TableHead className="w-[120px]">Difficulty</TableHead>
            <TableHead className="w-[120px]">Practice Count</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[150px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question, index) => (
            <TableRow key={question.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="line-clamp-1">{question.title}</span>
                  {question.bookmarked && (
                    <BookmarkIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={
                    question.difficulty === 'Easy' ? 'secondary' :
                    question.difficulty === 'Hard' ? 'destructive' :
                    'default'
                  }
                >
                  {question.difficulty || 'Medium'}
                </Badge>
              </TableCell>
              <TableCell>
                {question.practiceCount || 0} times
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {question.practiceCount && question.practiceCount > 0 ? 'Practiced' : 'New'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Link href={`${basePath}/${sectionType}/question/${question.id}`}>
                  <Button size="sm" variant="default">
                    <PlayCircle className="mr-1 h-4 w-4" />
                    Practice
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}