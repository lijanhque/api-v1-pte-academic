'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Clock, FileText, PenTool } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { initialCategories } from '@/lib/pte/data';

// Define types for our writing questions
type WritingQuestion = {
  id: string;
  title: string;
  description: string;
  instructions: string;
  example?: string;
  tips?: string[];
  preparationTime: number; // in seconds
  answerTime: number; // in seconds
  category: string;
  passage?: string;
};

type WritingTab = {
  id: string;
  title: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
  question_count?: number;
  questions: WritingQuestion[];
};

interface WritingPracticePageProps {
  params: {
    category: string;
  };
}

export default function WritingPracticePage({ params }: WritingPracticePageProps) {
  const { category } = params;
  const [activeTab, setActiveTab] = useState(category || 'summarize-written-text');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [phase, setPhase] = useState<'preparation' | 'writing'>('preparation');
  const [writingData, setWritingData] = useState<WritingTab[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch and transform the writing data from initialCategories
  useEffect(() => {
    const fetchWritingData = () => {
      // Get all writing categories (where parent is 2 - the writing parent)
      const writingCategories = initialCategories.filter(cat => cat.parent === 2);

      // Transform to the format expected by our component
      const transformedData: WritingTab[] = writingCategories.map(cat => ({
        id: cat.code,
        title: cat.title,
        shortName: cat.short_name || cat.code.toUpperCase(),
        description: cat.description,
        icon: cat.icon,
        color: cat.color || '#10b981', // Default green color if none provided
        question_count: cat.question_count,
        questions: [] // For now, we'll use placeholder questions
      }));

      // For now, create some placeholder questions for each category
      const dataWithQuestions = transformedData.map(tab => ({
        ...tab,
        questions: Array.from({ length: tab.question_count || 5 }, (_, i) => ({
          id: `${tab.id}-${i + 1}`,
          title: `${tab.title} Practice Question ${i + 1}`,
          description: tab.description,
          instructions: `Instructions for ${tab.title}. This is question ${i + 1} in the ${tab.title} category.`,
          example: `This is a sample ${tab.title} example`,
          tips: ['Sample tip 1', 'Sample tip 2'],
          preparationTime: tab.id.includes('summarize-written-text') ? 10 : 0,
          answerTime: tab.id.includes('summarize-written-text') ? 600 :
                     tab.id.includes('write-essay') ? 1200 : 600,
          category: tab.id,
          passage: tab.id.includes('summarize-written-text') ?
            'This is a sample passage for summarization. It contains information about various topics that need to be condensed into a single sentence summary. The passage discusses important concepts and ideas that students should understand.' : undefined
        }))
      }));

      setWritingData(dataWithQuestions);
      setLoading(false);
    };

    fetchWritingData();
  }, []);

  // Get the current tab data
  const currentTab = writingData.find(tab => tab.id === activeTab);
  const currentQuestion = currentTab?.questions[currentQuestionIndex];

  // Handle starting the question
  const startQuestion = () => {
    setPhase('preparation');
    setTimerActive(true);

    // Start preparation timer
    let timeLeft = currentQuestion?.preparationTime || 10;
    setTimer(timeLeft);

    const timerInterval = setInterval(() => {
      timeLeft -= 1;
      setTimer(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        setTimerActive(false);
        setPhase('writing');
        // Start writing timer
        let writingTime = currentQuestion?.answerTime || 600;
        setTimer(writingTime);

        const writingTimerInterval = setInterval(() => {
          writingTime -= 1;
          setTimer(writingTime);

          if (writingTime <= 0) {
            clearInterval(writingTimerInterval);
            setTimerActive(false);
          }
        }, 1000);
      }
    }, 1000);
  };

  // Navigate to next question
  const nextQuestion = () => {
    if (currentQuestion && currentQuestionIndex < currentTab!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setPhase('preparation');
      setTimerActive(false);
    }
  };

  // Navigate to previous question
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setUserAnswer('');
      setPhase('preparation');
      setTimerActive(false);
    }
  };

  // Reset timer when question changes
  useEffect(() => {
    if (currentQuestion) {
      setTimer(currentQuestion.preparationTime);
      setTimerActive(false);
      setPhase('preparation');
      setUserAnswer('');
    }
  }, [currentQuestionIndex, currentQuestion]);

  if (loading || !currentTab || !currentQuestion) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/pte/practice">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Practice
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">PTE Writing Practice</h1>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading writing practice...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/pte/practice">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Practice
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">PTE Writing Practice</h1>
            <p className="text-muted-foreground">Practice your writing skills for the PTE Academic test</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          {writingData.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex flex-col items-center">
              <div className="relative">
                <Image
                  src={tab.icon}
                  alt={tab.title}
                  width={32}
                  height={32}
                  className="mb-1"
                />
                <div
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 rounded-full text-xs"
                  style={{ backgroundColor: tab.color }}
                />
              </div>
              <span className="text-xs">{tab.shortName}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {writingData.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Question Bank */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Questions</span>
                      <span className="text-sm text-muted-foreground">({tab.questions.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                      {tab.questions.map((question, index) => (
                        <div
                          key={question.id}
                          className={`p-3 rounded cursor-pointer transition-colors ${
                            index === currentQuestionIndex
                              ? 'bg-primary/10 border border-primary'
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => setCurrentQuestionIndex(index)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full bg-primary/10">
                              {index + 1}
                            </span>
                            <span className="text-sm truncate">{question.title}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 ml-8">
                            {question.description.substring(0, 40)}...
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Question Content */}
              <div className="lg:col-span-3 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image
                        src={tab.icon}
                        alt={tab.title}
                        width={32}
                        height={32}
                        className="bg-gray-100 p-1 rounded"
                      />
                      <span>{currentQuestion.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-2">Instructions:</h3>
                        <div className="p-4 bg-blue-50 rounded-md text-sm">
                          <p>{currentQuestion.instructions}</p>
                        </div>
                      </div>

                      {currentQuestion.passage && (
                        <div>
                          <h3 className="font-medium mb-2">Passage:</h3>
                          <div className="p-4 bg-gray-50 rounded-md text-sm leading-relaxed">
                            <p>{currentQuestion.passage}</p>
                          </div>
                        </div>
                      )}

                      {currentQuestion.tips && currentQuestion.tips.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">Tips:</h3>
                          <ul className="list-disc list-inside space-y-1">
                            {currentQuestion.tips.map((tip, index) => (
                              <li key={index} className="text-muted-foreground">{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {phase === 'preparation' ? 'Preparation Time' : 'Writing Time'}
                          </span>
                          <span className="text-sm">{timer}s</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-1000"
                            style={{
                              width: `${(timer / (phase === 'preparation' ? currentQuestion.preparationTime : currentQuestion.answerTime)) * 100}%`,
                              backgroundColor: tab.color
                            }}
                          />
                        </div>
                      </div>

                      {phase === 'writing' && (
                        <div>
                          <h3 className="font-medium mb-2">Your Answer:</h3>
                          <Textarea
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Write your answer here..."
                            className="min-h-[200px] resize-none"
                          />
                          <div className="text-xs text-muted-foreground mt-1">
                            {userAnswer.length} characters
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {phase === 'preparation' && !timerActive && (
                          <Button onClick={startQuestion}>
                            <Clock className="w-4 h-4 mr-2" />
                            Start Preparation
                          </Button>
                        )}

                        {phase === 'writing' && (
                          <>
                            <Button variant="outline">Save Draft</Button>
                            <Button>Submit Answer</Button>
                          </>
                        )}
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button
                          onClick={prevQuestion}
                          variant="outline"
                          disabled={currentQuestionIndex === 0}
                        >
                          Previous
                        </Button>

                        <Button
                          onClick={nextQuestion}
                          variant="outline"
                          disabled={currentQuestionIndex === tab.questions.length - 1}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Feedback Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PenTool className="w-5 h-5" />
                      <span>AI Feedback</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">7.5</div>
                        <div className="text-sm text-muted-foreground">Overall Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-500">8.0</div>
                        <div className="text-sm text-muted-foreground">Content</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-500">7.0</div>
                        <div className="text-sm text-muted-foreground">Grammar</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Feedback Summary:</h4>
                      <p className="text-sm text-muted-foreground">
                        Good content with clear ideas. Work on grammar accuracy and sentence variety.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}