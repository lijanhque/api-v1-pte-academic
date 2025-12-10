'use client'
// Force dynamic rendering to avoid DB queries during build
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Play,
  RotateCcw,
  TrendingUp,
  Users,
} from 'lucide-react'
import useSWR from 'swr'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getTests } from '@/lib/db/queries'
import { PteTest } from '@/lib/db/schema'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function MockTestsPage() {
  const { data: tests, error } = useSWR<PteTest[]>('/api/pte-practice', fetcher)

  if (error) return <div>Failed to load mock tests.</div>
  if (!tests) return <div>Loading...</div>

  // Stats calculations based on available data
  const totalTests = tests.length
  const completedTests = 0 // No status in schema yet
  const avgScore = 0 // No score in schema yet
  const bestScore = 0 // No score in schema yet

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">PTE Mock Tests</h1>
          <p className="text-muted-foreground">
            Take full-length practice tests to simulate the real exam experience
          </p>
        </div>
        <Button>
          <Play className="mr-2 h-4 w-4" />
          Start New Test
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <BookOpen className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTests}</div>
            <p className="text-xs text-gray-500">Available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTests}</div>
            <p className="text-xs text-gray-500">Practice completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore}/90</div>
            <p className="text-xs text-gray-500">Across all tests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestScore}/90</div>
            <p className="text-xs text-gray-500">Personal best</p>
          </CardContent>
        </Card>
      </div>

      {/* Mock Tests List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Available Mock Tests</h2>
        {tests.map((test) => (
          <Card key={test.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {test.title}
                    <Badge variant={test.isPremium ? 'default' : 'secondary'}>
                      {test.isPremium ? 'Premium' : 'Free'}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {test.duration}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button asChild>
                    <Link href={`/pte/mock-tests/${test.id}`}>
                      <Play className="mr-2 h-4 w-4" />
                      Start Test
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p>{test.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
