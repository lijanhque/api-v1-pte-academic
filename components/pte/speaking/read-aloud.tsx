'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Mic, Square, Volume2, RotateCcw, CheckCircle, Loader2, AlertCircle, Clock } from 'lucide-react'
import { submitAttempt } from '@/lib/actions/pte'
import { useToast } from '@/hooks/use-toast'
import { ScoreDetailsModal } from './score-details-modal'
import { ScoringProgressModal } from './scoring-progress-modal'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ReadAloudProps {
    question: any
}

type Phase = 'idle' | 'preparing' | 'beep' | 'recording' | 'finished' | 'submitting' | 'scored'

export function ReadAloud({ question }: ReadAloudProps) {
    const [phase, setPhase] = useState<Phase>('idle')
    const [timeLeft, setTimeLeft] = useState(30) // Preparation time
    const [recordingTime, setRecordingTime] = useState(0)
    const [totalTime, setTotalTime] = useState(0)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isScoringModalOpen, setIsScoringModalOpen] = useState(false)
    const [isScoreModalOpen, setIsScoreModalOpen] = useState(false)
    const [result, setResult] = useState<any>(null)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const totalTimerRef = useRef<NodeJS.Timeout | null>(null)
    const beepAudioRef = useRef<HTMLAudioElement | null>(null)
    const { toast } = useToast()

    // Preparation and recording times
    const PREP_TIME = 30
    const RECORDING_TIME = 40

    useEffect(() => {
        // Create beep sound
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

        beepAudioRef.current = {
            play: () => {
                const osc = audioContext.createOscillator()
                const gain = audioContext.createGain()
                osc.connect(gain)
                gain.connect(audioContext.destination)
                osc.frequency.value = 800
                osc.type = 'sine'
                gain.gain.value = 0.3
                osc.start()
                osc.stop(audioContext.currentTime + 0.2)
            }
        } as any

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
            if (totalTimerRef.current) clearInterval(totalTimerRef.current)
        }
    }, [])

    // Total timer effect
    useEffect(() => {
        if (phase === 'preparing' || phase === 'recording') {
            totalTimerRef.current = setInterval(() => {
                setTotalTime((t) => t + 1)
            }, 1000)
        } else {
            if (totalTimerRef.current) clearInterval(totalTimerRef.current)
        }

        return () => {
            if (totalTimerRef.current) clearInterval(totalTimerRef.current)
        }
    }, [phase])

    const startPractice = () => {
        setPhase('preparing')
        setTimeLeft(PREP_TIME)
        setTotalTime(0)

        // Start preparation countdown
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current)
                    playBeepAndStartRecording()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const playBeepAndStartRecording = () => {
        setPhase('beep')

        // Play beep sound
        if (beepAudioRef.current) {
            beepAudioRef.current.play()
        }

        // Wait for beep to finish, then start recording
        setTimeout(() => {
            startRecording()
        }, 500)
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            chunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data)
                }
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                setAudioBlob(blob)
                setAudioUrl(URL.createObjectURL(blob))
                setPhase('finished')
            }

            mediaRecorder.start()
            setPhase('recording')
            setRecordingTime(0)

            // Auto-stop after 40 seconds
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => {
                    if (prev >= RECORDING_TIME - 1) {
                        stopRecording()
                        return RECORDING_TIME
                    }
                    return prev + 1
                })
            }, 1000)
        } catch (err) {
            console.error('Error accessing microphone:', err)
            toast({
                title: 'Microphone Error',
                description: 'Could not access microphone. Please check permissions.',
                variant: 'destructive',
            })
            setPhase('idle')
        }
    }

    const stopRecording = () => {
        if (timerRef.current) clearInterval(timerRef.current)

        if (mediaRecorderRef.current && phase === 'recording') {
            // Play ending beep
            if (beepAudioRef.current) {
                beepAudioRef.current.play()
            }

            mediaRecorderRef.current.stop()
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
        }
    }

    const handleSubmit = async () => {
        if (!audioBlob) return

        setPhase('submitting')
        setIsScoringModalOpen(true)
        setIsSubmitting(true)

        try {
            // Upload to Vercel Blob storage
            const formData = new FormData()
            formData.append('file', audioBlob, `recording-${Date.now()}.webm`)
            formData.append('type', 'read_aloud')
            formData.append('questionId', question.id)
            formData.append('ext', 'webm')

            const uploadRes = await fetch('/api/uploads/audio', {
                method: 'POST',
                body: formData,
            })

            if (!uploadRes.ok) throw new Error('Upload failed')

            const { url } = await uploadRes.json()

            // Submit attempt with AI scoring
            const res = await submitAttempt({
                questionId: question.id,
                questionType: 'read_aloud',
                audioUrl: url,
                transcript: question.promptText, // Mock transcript
                durationMs: recordingTime * 1000,
            })

            setResult(res)
            setPhase('scored')
            setIsScoringModalOpen(false)
            setIsScoreModalOpen(true)

            toast({
                title: 'Success',
                description: 'Your response has been submitted and scored!',
            })
        } catch (error: any) {
            console.error('Submit error:', error)
            setIsScoringModalOpen(false)
            toast({
                title: 'Error',
                description: error.message || 'Failed to submit. Please try again.',
                variant: 'destructive',
            })
            setPhase('finished')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReset = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        if (totalTimerRef.current) clearInterval(totalTimerRef.current)
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
        }

        setPhase('idle')
        setTimeLeft(PREP_TIME)
        setRecordingTime(0)
        setTotalTime(0)
        setAudioBlob(null)
        setAudioUrl(null)
        setResult(null)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const getPhaseText = () => {
        switch (phase) {
            case 'idle':
                return 'Ready to start'
            case 'preparing':
                return `Prepare: ${timeLeft}s`
            case 'beep':
                return 'Starting...'
            case 'recording':
                return `Recording: ${recordingTime}s / ${RECORDING_TIME}s`
            case 'finished':
                return 'Recording complete'
            case 'submitting':
                return 'Submitting...'
            case 'scored':
                return 'Scored!'
            default:
                return ''
        }
    }

    return (
        <div className="space-y-6">
            {/* Timer */}
            <div className="flex items-center justify-between">
                <div className={`text-sm font-medium ${(phase === 'preparing' || phase === 'recording') ? 'text-red-500' : 'text-muted-foreground'}`}>
                    <Clock className="inline h-4 w-4 mr-1" />
                    Time: {formatTime(totalTime)}
                </div>
                {question.difficulty && (
                    <Badge variant="outline" className="capitalize">
                        {question.difficulty}
                    </Badge>
                )}
            </div>

            {/* Instructions */}
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Please examine the text provided below. You are required to read it out loud as naturally as you can. Remember, you only have 40 seconds to complete this task.
                </AlertDescription>
            </Alert>

            {/* Text to read */}
            <div className="p-6 bg-white dark:bg-muted/30 rounded-lg border border-border/50">
                <p className="text-base leading-relaxed text-gray-900 dark:text-foreground">
                    {question.promptText || question.title}
                </p>
            </div>

            {/* Recording Area */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-center">{getPhaseText()}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!result || phase !== 'scored' ? (
                        <div className="flex flex-col items-center justify-center gap-6 py-8">
                            {/* Progress Bars */}
                            {phase === 'preparing' && (
                                <div className="w-full max-w-md space-y-2">
                                    <Progress value={((PREP_TIME - timeLeft) / PREP_TIME) * 100} className="h-2" />
                                    <p className="text-sm text-center text-muted-foreground">
                                        Prepare to read aloud...
                                    </p>
                                </div>
                            )}

                            {phase === 'recording' && (
                                <div className="w-full max-w-md space-y-2">
                                    <Progress value={(recordingTime / RECORDING_TIME) * 100} className="h-2" />
                                    <p className="text-sm text-center text-muted-foreground">
                                        Recording...
                                    </p>
                                </div>
                            )}

                            {/* Control Buttons */}
                            {phase === 'idle' && (
                                <Button size="lg" onClick={startPractice} className="h-24 w-24 rounded-full">
                                    <Volume2 className="h-10 w-10" />
                                </Button>
                            )}

                            {phase === 'recording' && (
                                <Button
                                    size="lg"
                                    variant="destructive"
                                    onClick={stopRecording}
                                    className="h-24 w-24 rounded-full animate-pulse"
                                >
                                    <Square className="h-10 w-10" />
                                </Button>
                            )}

                            {phase === 'finished' && audioUrl && (
                                <div className="flex flex-col items-center gap-4 w-full">
                                    <audio controls src={audioUrl} className="w-full max-w-md" />
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={handleReset}>
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            Retry
                                        </Button>
                                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Submit
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                                    <span className="text-4xl font-bold text-green-600 dark:text-green-400">
                                        {result.score?.overall_score || 0}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold">Overall Score</h3>
                                <p className="text-muted-foreground">AI Assessment Complete</p>
                            </div>

                            <Button className="w-full" variant="outline" onClick={handleReset}>
                                Practice Again
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Scoring Progress Modal */}
            <ScoringProgressModal
                open={isScoringModalOpen}
                onOpenChange={setIsScoringModalOpen}
            />

            {/* Score Details Modal */}
            {result?.score && (
                <ScoreDetailsModal
                    open={isScoreModalOpen}
                    onOpenChange={setIsScoreModalOpen}
                    score={result.score}
                    transcript={question.promptText}
                    originalText={question.promptText}
                />
            )}
        </div>
    )
}
