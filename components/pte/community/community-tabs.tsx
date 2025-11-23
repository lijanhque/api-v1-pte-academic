'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CommunityBoard, CommunityBoardSkeleton } from './community-board'
import { DiscussionBoard } from './discussion-board'
import { Suspense, useEffect, useState } from 'react'
import { getAllAttempts, getCommunityStats } from '@/lib/actions/community'
import { MessageSquare, Users } from 'lucide-react'

interface CommunityTabsProps {
    searchParams: { page?: string; type?: string; sort?: string; tab?: string }
}

export function CommunityTabs({ searchParams }: CommunityTabsProps) {
    const [attemptsData, setAttemptsData] = useState<any>(null)
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const activeTab = searchParams.tab || 'board'

    useEffect(() => {
        async function loadData() {
            try {
                const page = parseInt(searchParams.page || '1')
                const type = searchParams.type as any
                const sortBy = (searchParams.sort || 'recent') as 'recent' | 'top_score'

                const [data, statsData] = await Promise.all([
                    getAllAttempts({ page, type, sortBy, limit: 20 }),
                    getCommunityStats(),
                ])

                setAttemptsData(data)
                setStats(statsData)
            } catch (error) {
                console.error('Error loading community data:', error)
            } finally {
                setLoading(false)
            }
        }

        if (activeTab === 'board') {
            loadData()
        }
    }, [searchParams, activeTab])

    return (
        <Tabs defaultValue={activeTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="discussion" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Discussion
                </TabsTrigger>
                <TabsTrigger value="board" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Board
                </TabsTrigger>
            </TabsList>

            <TabsContent value="discussion" className="mt-6">
                <DiscussionBoard />
            </TabsContent>

            <TabsContent value="board" className="mt-6">
                {loading ? (
                    <CommunityBoardSkeleton />
                ) : (
                    attemptsData && stats && (
                        <CommunityBoard initialData={attemptsData} stats={stats} />
                    )
                )}
            </TabsContent>
        </Tabs>
    )
}
