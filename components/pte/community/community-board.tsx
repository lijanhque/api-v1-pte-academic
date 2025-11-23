'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { AttemptCard } from './attempt-card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, TrendingUp, BarChart3 } from 'lucide-react'

interface CommunityBoardProps {
    initialData: {
        attempts: any[]
        total: number
        page: number
        totalPages: number
    }
    stats: {
        totalAttempts: number
        totalUsers: number
        avgScore: number
    }
}

export function CommunityBoard({ initialData, stats }: CommunityBoardProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const typeFilter = searchParams.get('type') || 'all'
    const sortBy = searchParams.get('sort') || 'recent'

    const createQueryString = (name: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(name, value)
        // Reset page when filter/sort changes
        if (name !== 'page') {
            params.set('page', '1')
        }
        return params.toString()
    }

    const handleFilterChange = (value: string) => {
        router.push(pathname + '?' + createQueryString('type', value))
    }

    const handleSortChange = (value: string) => {
        router.push(pathname + '?' + createQueryString('sort', value))
    }

    const handlePageChange = (newPage: number) => {
        router.push(pathname + '?' + createQueryString('page', newPage.toString()))
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <BarChart3 className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Attempts</p>
                                <p className="text-2xl font-bold">{stats.totalAttempts}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Active Users</p>
                                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Average Score</p>
                                <p className="text-2xl font-bold">{Math.round(stats.avgScore || 0)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
                <Select value={typeFilter} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Question Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="read_aloud">Read Aloud</SelectItem>
                        <SelectItem value="repeat_sentence">Repeat Sentence</SelectItem>
                        <SelectItem value="describe_image">Describe Image</SelectItem>
                        <SelectItem value="retell_lecture">Retell Lecture</SelectItem>
                        <SelectItem value="answer_short_question">Answer Short Question</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="top_score">Top Score</SelectItem>
                    </SelectContent>
                </Select>

                <div className="ml-auto text-sm text-muted-foreground">
                    {initialData.total} total attempts
                </div>
            </div>

            {/* Attempts Grid */}
            {initialData.attempts.length === 0 ? (
                <Card className="p-12 text-center">
                    <p className="text-muted-foreground">
                        No attempts found. Be the first to practice!
                    </p>
                    <Button className="mt-4" asChild>
                        <a href="/pte/academic/practice/speaking/read-aloud">
                            Start Practicing
                        </a>
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {initialData.attempts.map((attempt) => (
                        <AttemptCard key={attempt.id} attempt={attempt} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {initialData.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        disabled={initialData.page === 1}
                        onClick={() => handlePageChange(initialData.page - 1)}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground px-4">
                        Page {initialData.page} of {initialData.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={initialData.page === initialData.totalPages}
                        onClick={() => handlePageChange(initialData.page + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    )
}

export function CommunityBoardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardContent className="pt-6">
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters Skeleton */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-[200px]" />
                <Skeleton className="h-10 w-[180px]" />
            </div>

            {/* Attempts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardContent className="pt-6 space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
