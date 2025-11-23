'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AudioPlayer } from './audio-player'
import { formatDistanceToNow } from 'date-fns'
import { Trophy, Clock, Mic } from 'lucide-react'

interface AttemptCardProps {
    attempt: {
        id: string
        audioUrl: string
        transcript: string | null
        scores: any
        createdAt: Date
        durationMs: number
        userName: string | null
        userEmail: string | null
        userImage: string | null
        questionTitle: string | null
        questionDifficulty: string | null
        type: string
    }
}

export function AttemptCard({ attempt }: AttemptCardProps) {
    const overallScore = attempt.scores?.overall_score || 0
    const breakdown = attempt.scores?.breakdown || {}

    const getScoreColor = (score: number) => {
        if (score >= 70) return 'bg-green-500/20 text-green 400 border-green-500/30'
        if (score >= 50) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        return 'bg-red-500/20 text-red-400 border-red-500/30'
    }

    const formatDuration = (ms: number) => {
        const seconds = Math.floor(ms / 1000)
        return `${seconds}s`
    }

    return (
        <Card className="border-border/50 hover:border-border transition-colors">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={attempt.userImage || ''} />
                            <AvatarFallback>
                                {attempt.userName?.charAt(0) || attempt.userEmail?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-sm">
                                {attempt.userName || attempt.userEmail?.split('@')[0] || 'Anonymous'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(attempt.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                    </div>

                    {/* Score Badge */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getScoreColor(overallScore)}`}>
                        <Trophy className="h-4 w-4" />
                        <span className="font-bold text-lg">{overallScore}</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Question Info */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="capitalize">
                        {attempt.type?.replace('_', ' ')}
                    </Badge>
                    {attempt.questionDifficulty && (
                        <Badge
                            variant="outline"
                            className={
                                attempt.questionDifficulty === 'Easy'
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                    : attempt.questionDifficulty === 'Medium'
                                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }
                        >
                            {attempt.questionDifficulty}
                        </Badge>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                        <Clock className="h-3 w-3" />
                        {formatDuration(attempt.durationMs)}
                    </div>
                </div>

                {/* Question Title */}
                {attempt.questionTitle && (
                    <p className="text-sm font-medium">{attempt.questionTitle}</p>
                )}

                {/* Audio Player */}
                <AudioPlayer src={attempt.audioUrl} />

                {/* Score Breakdown */}
                {Object.keys(breakdown).length > 0 && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                        {Object.entries(breakdown).map(([key, value]: [string, any]) => (
                            <div key={key} className="text-center">
                                <p className="text-xs text-muted-foreground capitalize">
                                    {key.replace('_', ' ')}
                                </p>
                                <p className="text-sm font-semibold">{value}/90</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Transcript Preview */}
                {attempt.transcript && (
                    <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Mic className="h-3 w-3" />
                            Transcript
                        </p>
                        <p className="text-sm line-clamp-2">{attempt.transcript}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
