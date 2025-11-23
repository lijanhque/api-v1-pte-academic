'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, ThumbsUp, MessageCircle } from 'lucide-react'

export function DiscussionBoard() {
    // Placeholder discussions - can be populated from database later
    const discussions = [
        {
            id: '1',
            title: 'Tips for Read Aloud practice?',
            author: 'Student A',
            replies: 12,
            likes: 8,
            timestamp: '2 hours ago',
        },
        {
            id: '2',
            title: 'How to improve pronunciation score?',
            author: 'Student B',
            replies: 5,
            likes: 3,
            timestamp: '5 hours ago',
        },
        {
            id: '3',
            title: 'Best strategy for repeat sentence?',
            author: 'Student C',
            replies: 18,
            likes: 15,
            timestamp: '1 day ago',
        },
    ]

    return (
        <div className="space-y-4">
            {/* Create Discussion Button */}
            <div className="flex justify-between items-center">
                <p className="text-muted-foreground text-sm">
                    Ask questions, share tips, and learn from the community
                </p>
                <Button>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    New Discussion
                </Button>
            </div>

            {/* Discussion List */}
            <div className="space-y-3">
                {discussions.map((discussion) => (
                    <Card key={discussion.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium">
                                {discussion.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-4">
                                    <span>by <span className="font-medium">{discussion.author}</span></span>
                                    <span className="flex items-center gap-1">
                                        <MessageCircle className="h-4 w-4" />
                                        {discussion.replies} replies
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <ThumbsUp className="h-4 w-4" />
                                        {discussion.likes}
                                    </span>
                                </div>
                                <span>{discussion.timestamp}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Placeholder for no discussions */}
            {discussions.length === 0 && (
                <Card className="p-12 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                        No discussions yet. Start the conversation!
                    </p>
                    <Button className="mt-4">
                        Create First Discussion
                    </Button>
                </Card>
            )}
        </div>
    )
}
