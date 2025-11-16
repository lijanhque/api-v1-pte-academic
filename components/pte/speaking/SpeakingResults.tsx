"use client"

import * as React from "react"
import { TranscriptViewer, type Word } from "@/components/ui/transcript-viewer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface SpeakingScore {
  content?: number
  pronunciation?: number
  oralFluency?: number
  total?: number
}

interface SpeakingResultsProps {
  transcript?: string
  words?: Word[]
  referenceText?: string
  scores?: SpeakingScore
  durationMs?: number
  wordsPerMinute?: number
  fillerRate?: number
}

export function SpeakingResults({
  transcript,
  words,
  referenceText,
  scores,
  durationMs,
  wordsPerMinute,
  fillerRate,
}: SpeakingResultsProps) {
  const formatDuration = (ms?: number) => {
    if (!ms) return "0s"
    const seconds = Math.floor(ms / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  const getScoreColor = (score?: number, maxScore: number = 90) => {
    if (!score) return "text-muted-foreground"
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return "text-green-600 dark:text-green-400"
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getScoreColor5 = (score?: number) => getScoreColor(score, 5)

  return (
    <div className="space-y-6">
      {/* Scores Overview */}
      {scores && (
        <Card>
          <CardHeader>
            <CardTitle>Scoring Results</CardTitle>
            <CardDescription>Your performance breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Total Score - 0-90 scale */}
            {scores.total !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Total Score</span>
                  <span className={`text-2xl font-bold ${getScoreColor(scores.total, 90)}`}>
                    {Math.round(scores.total)}/90
                  </span>
                </div>
                <Progress value={(scores.total / 90) * 100} className="h-2" />
              </div>
            )}

            {/* Individual Scores - Official PTE Academic 0-5 scale */}
            <div className="grid gap-4 sm:grid-cols-3">
              {scores.content !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Content</span>
                    <span className={`text-lg font-semibold ${getScoreColor5(scores.content)}`}>
                      {Math.round(scores.content)}/5
                    </span>
                  </div>
                  <Progress value={(scores.content / 5) * 100} className="h-1.5" />
                </div>
              )}

              {scores.pronunciation !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Pronunciation</span>
                    <span className={`text-lg font-semibold ${getScoreColor5(scores.pronunciation)}`}>
                      {Math.round(scores.pronunciation)}/5
                    </span>
                  </div>
                  <Progress value={(scores.pronunciation / 5) * 100} className="h-1.5" />
                </div>
              )}

              {scores.oralFluency !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Oral Fluency</span>
                    <span className={`text-lg font-semibold ${getScoreColor5(scores.oralFluency)}`}>
                      {Math.round(scores.oralFluency)}/5
                    </span>
                  </div>
                  <Progress value={(scores.oralFluency / 5) * 100} className="h-1.5" />
                </div>
              )}
            </div>

            {/* Metrics */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              {durationMs !== undefined && (
                <Badge variant="outline">
                  Duration: {formatDuration(durationMs)}
                </Badge>
              )}
              {wordsPerMinute !== undefined && (
                <Badge variant="outline">
                  WPM: {Math.round(wordsPerMinute)}
                </Badge>
              )}
              {fillerRate !== undefined && (
                <Badge variant="outline">
                  Filler Rate: {(fillerRate * 100).toFixed(1)}%
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transcript */}
      <TranscriptViewer
        transcript={transcript}
        words={words}
        referenceText={referenceText}
        showTimestamps={false}
        showConfidence={true}
        highlightErrors={true}
      />
    </div>
  )
}
