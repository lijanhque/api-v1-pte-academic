'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, BookOpen, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { initialCategories } from '@/lib/pte/data';

// Define types for our reading questions
type ReadingQuestion = {
  id: string;
  title: string;
  description: string;
  instructions: string;
  example?: string;
  tips?: string[];
  timeLimit: number; // in seconds
  category: string;
  passage?: string;
  question?: string;
  options?: string[];
  correctAnswer?: string;
  blanks?: { [key: string]: string };
};

type ReadingTab = {
  id: string;
  title: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
  question_count?: number;
  questions: ReadingQuestion[];
};

interface ReadingPracticePageProps {
  params: {
    category: string;
  };
}

export default function ReadingPracticePage({ params }: ReadingPracticePageProps) {
  const { category } = params;
  const [activeTab, setActiveTab] = useState(category || 'reading-writing-fill-blanks');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [filledBlanks, setFilledBlanks] = useState<{ [key: string]: string }>({});
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [readingData, setReadingData] = useState<ReadingTab[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch and transform the reading data from initialCategories
  useEffect(() => {
    const fetchReadingData = () => {
      // Get all reading categories (where parent is 3 - the reading parent)
      const readingCategories = initialCategories.filter(cat => cat.parent === 3);

      // Transform to the format expected by our component
      const transformedData: ReadingTab[] = readingCategories.map(cat => ({
        id: cat.code,
        title: cat.title,
        shortName: cat.short_name || cat.code.toUpperCase(),
        description: cat.description,
        icon: cat.icon,
        color: cat.color || '#f59e0b', // Default amber color if none provided
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
          timeLimit: 90, // Most reading questions have 90 seconds
          category: tab.id,
          passage: tab.id.includes('fill-blanks') ?
            'The __________ of artificial intelligence has revolutionized many industries. Companies are now using AI to __________ tasks that were previously done by humans. This technological advancement has led to both opportunities and __________.' :
            'Artificial intelligence (AI) is transforming various industries by automating complex tasks and providing insights from large datasets. While AI offers significant benefits, it also raises important ethical considerations about job displacement and privacy concerns.',
          question: tab.id.includes('multiple-choice') ?
            'What is the main topic of the passage?' :
            tab.id.includes('reorder') ?
            'Reorder the following paragraphs to form a coherent text.' :
            'Fill in the blanks with appropriate words.',
          options: tab.id.includes('multiple-choice') ?
            ['The benefits of AI', 'The history of technology', 'Environmental concerns', 'Economic development'] : undefined,
          correctAnswer: tab.id.includes('multiple-choice') ? 'The benefits of AI' : undefined,
          blanks: tab.id.includes('fill-blanks') ? {
            '1': 'development',
            '2': 'automate',
            '3': 'challenges'
          } : undefined
        }))
      }));

      setReadingData(dataWithQuestions);
      setLoading(false);
    };

    fetchReadingData();
  }, []);

  // Get the current tab data
  const currentTab = readingData.find(tab => tab.id === activeTab);
  const currentQuestion = currentTab?.questions[currentQuestionIndex];

  // Handle starting the question
  const startQuestion = () => {
    setTimerActive(true);

    // Start timer
    let timeLeft = currentQuestion?.timeLimit || 90;
    setTimer(timeLeft);

    const timerInterval = setInterval(() => {
      timeLeft -= 1;
      setTimer(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        setTimerActive(false);
      }
    }, 1000);
  };

  // Handle fill-in-the-blanks input
  const handleBlankChange = (blankId: string, value: string) => {
    setFilledBlanks(prev => ({
      ...prev,
      [blankId]: value
    }));
  };

  // Navigate to next question
  const nextQuestion = () => {
    if (currentQuestion && currentQuestionIndex < currentTab!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setSelectedOption('');
      setFilledBlanks({});
      setTimerActive(false);
    }
  };

  // Navigate to previous question
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setUserAnswer('');
      setSelectedOption('');
      setFilledBlanks({});
      setTimerActive(false);
    }
  };

  // Reset timer when question changes
  useEffect(() => {
    if (currentQuestion) {
      setTimer(currentQuestion.timeLimit);
      setTimerActive(false);
      setUserAnswer('');
      setSelectedOption('');
      setFilledBlanks({});
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
          <h1 className="text-2xl font-bold">PTE Reading Practice</h1>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading reading practice...</p>
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
            <h1 className="text-2xl font-bold">PTE Reading Practice</h1>
            <p className="text-muted-foreground">Practice your reading skills for the PTE Academic test</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {readingData.map((tab) => (
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

        {readingData.map((tab) => (
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
                            {tab.id.includes('fill-blanks') ? (
                              <div>
                                {currentQuestion.passage.split('__________').map((part, index, array) => (
                                  <span key={index}>
                                    {part}
                                    {index < array.length - 1 && (
                                      <input
                                        type="text"
                                        className="mx-1 px-2 py-1 border border-gray-300 rounded text-sm w-20"
                                        value={filledBlanks[index + 1] || ''}
                                        onChange={(e) => handleBlankChange((index + 1).toString(), e.target.value)}
                                        placeholder={`Blank ${index + 1}`}
                                      />
                                    )}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p>{currentQuestion.passage}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {currentQuestion.question && (
                        <div>
                          <h3 className="font-medium mb-2">Question:</h3>
                          <p className="text-sm">{currentQuestion.question}</p>
                        </div>
                      )}

                      {currentQuestion.options && (
                        <div>
                          <h3 className="font-medium mb-2">Options:</h3>
                          <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                            {currentQuestion.options.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <RadioGroupItem value={option} id={`option-${index}`} />
                                <Label htmlFor={`option-${index}`}>{option}</Label>
                              </div>
                            ))}
                          </RadioGroup>
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
                          <span className="text-sm font-medium">Time Remaining</span>
                          <span className="text-sm">{timer}s</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-1000"
                            style={{
                              width: `${(timer / currentQuestion.timeLimit) * 100}%`,
                              backgroundColor: tab.color
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {!timerActive && (
                          <Button onClick={startQuestion}>
                            <BookOpen className="w-4 h-4 mr-2" />
                            Start Question
                          </Button>
                        )}

                        <Button variant="outline">Save Answer</Button>
                        <Button>Submit Answer</Button>
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
                      <CheckCircle className="w-5 h-5" />
                      <span>AI Feedback</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">8.0</div>
                        <div className="text-sm text-muted-foreground">Overall Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-500">8.5</div>
                        <div className="text-sm text-muted-foreground">Comprehension</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-500">7.5</div>
                        <div className="text-sm text-muted-foreground">Accuracy</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Feedback Summary:</h4>
                      <p className="text-sm text-muted-foreground">
                        Good understanding of the passage. Work on reading speed and answer precision.
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