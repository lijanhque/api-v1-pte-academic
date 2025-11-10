'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  RotateCcw, 
  Pause, 
  Square, 
  Clock, 
  CheckCircle, 
  XCircle,
  Volume2,
  Mic
} from 'lucide-react';
import Link from 'next/link';
import { MockTest, MockTestSection, MockTestQuestion } from '@/lib/pte/mock-test-data';

interface MockTestSimulatorProps {
  mockTest: MockTest;
}

export default function MockTestSimulator({ mockTest }: MockTestSimulatorProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [testStatus, setTestStatus] = useState<'not-started' | 'in-progress' | 'completed'>(mockTest.status as any || 'not-started');
  const [audioPlaying, setAudioPlaying] = useState(false);

  const currentSection = mockTest.sections[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];

  // Initialize timer when section/question changes
  useEffect(() => {
    if (currentQuestion && testStatus === 'in-progress') {
      setTimeRemaining(currentQuestion.duration);
    }
  }, [currentQuestionIndex, currentSectionIndex, testStatus, currentQuestion]);

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (testStatus === 'in-progress' && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleNextQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeRemaining, testStatus]);

  const startTest = () => {
    setTestStatus('in-progress');
    setTimeRemaining(currentQuestion?.duration || 0);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentSectionIndex < mockTest.sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      // Test completed
      setTestStatus('completed');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentSectionIndex > 0) {
      const prevSection = mockTest.sections[currentSectionIndex - 1];
      setCurrentSectionIndex(prev => prev - 1);
      setCurrentQuestionIndex(prevSection.questions.length - 1);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const playAudio = () => {
    setAudioPlaying(true);
    // Simulate audio playback
    setTimeout(() => setAudioPlaying(false), 2000);
  };

  if (testStatus === 'not-started') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">PTE Academic Mock Test</CardTitle>
            <CardDescription>Prepare for your PTE exam with this full-length practice test</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{mockTest.sections.length}</div>
                <div className="text-sm text-gray-500">Sections</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {mockTest.sections.reduce((acc, section) => acc + section.questions.length, 0)}
                </div>
                <div className="text-sm text-gray-500">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{mockTest.duration}</div>
                <div className="text-sm text-gray-500">Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">PTE</div>
                <div className="text-sm text-gray-500">Academic</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Test Sections:</h3>
              <div className="grid grid-cols-2 gap-2">
                {mockTest.sections.map((section, idx) => (
                  <Badge key={idx} variant="secondary" className="py-2">
                    {section.name} ({section.questions.length} questions)
                  </Badge>
                ))}
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="w-full max-w-sm mx-auto"
              onClick={startTest}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Mock Test
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Test Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{mockTest.title}</h1>
          <div className="flex items-center gap-4 mt-1">
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-1" />
              {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
            </Badge>
            <Badge variant="outline">
              {currentSectionIndex + 1}/{mockTest.sections.length} Sections
            </Badge>
            <Badge variant="outline">
              {currentQuestionIndex + 1}/{currentSection.questions.length} Questions
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Review
          </Button>
          <Button variant="outline" size="sm">
            <Square className="w-4 h-4 mr-2" />
            Exit
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{currentSection.name}</span>
            <span className="text-sm text-gray-500">
              {currentQuestionIndex + 1}/{currentSection.questions.length}
            </span>
          </div>
          <Progress 
            value={((currentQuestionIndex + 1) / currentSection.questions.length) * 100} 
            className="h-2" 
          />
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{currentQuestion?.type}</Badge>
                  <CardTitle>{currentQuestion?.title}</CardTitle>
                </div>
                <Badge variant="outline">
                  {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-gray-700">{currentQuestion?.description}</p>
                
                {/* Question-specific UI based on type */}
                {currentQuestion?.type.includes('Read Aloud') && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-lg leading-relaxed">
                      The Australian government has announced a new initiative to improve education outcomes across the country. 
                      This comprehensive plan focuses on enhancing digital literacy, promoting STEM education, and providing better 
                      support for students from disadvantaged backgrounds.
                    </p>
                  </div>
                )}
                
                {currentQuestion?.type.includes('Repeat Sentence') && (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="bg-gray-100 border-2 border-dashed rounded-xl w-full h-32 flex items-center justify-center">
                      <span className="text-gray-500">Audio Content</span>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={playAudio}
                      disabled={audioPlaying}
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      {audioPlaying ? 'Playing...' : 'Listen'}
                    </Button>
                  </div>
                )}
                
                {currentQuestion?.type.includes('Describe Image') && (
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center">
                      <span className="text-gray-500">Question Image</span>
                    </div>
                    <p className="mt-4 text-center text-gray-600">Describe the image in detail.</p>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0 && currentSectionIndex === 0}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button variant="outline">Mark for Review</Button>
                    <Button onClick={handleNextQuestion}>
                      {currentQuestionIndex === currentSection.questions.length - 1 ? 'Next Section' : 'Next Question'}
                    </Button>
                  </div>
                </div>
                
                {/* Recording Controls */}
                {(currentQuestion?.type.includes('Read Aloud') || 
                  currentQuestion?.type.includes('Repeat Sentence') || 
                  currentQuestion?.type.includes('Describe Image')) && (
                  <div className="flex justify-center pt-4">
                    <Button 
                      onClick={toggleRecording}
                      variant={isRecording ? "destructive" : "default"}
                      size="lg"
                    >
                      <Mic className={`w-5 h-5 mr-2 ${isRecording ? 'animate-pulse' : ''}`} />
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Section Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Section Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs 
                value={currentSection.name} 
                onValueChange={(value) => {
                  const sectionIndex = mockTest.sections.findIndex(s => s.name === value);
                  if (sectionIndex !== -1) {
                    setCurrentSectionIndex(sectionIndex);
                    setCurrentQuestionIndex(0);
                  }
                }}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 w-full">
                  {mockTest.sections.map((section, idx) => (
                    <TabsTrigger 
                      key={idx} 
                      value={section.name}
                      className={currentSectionIndex === idx ? 'bg-primary text-white' : ''}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-xs">{section.name.substring(0, 3)}</span>
                        <span className="text-xs">{section.questions.length}</span>
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {mockTest.sections.map((section, sectionIdx) => (
                  <TabsContent key={sectionIdx} value={section.name} className="space-y-2">
                    <div className="text-sm font-medium mb-2">{section.name} Questions</div>
                    <div className="grid grid-cols-4 gap-2">
                      {section.questions.map((_, qIdx) => (
                        <Button
                          key={qIdx}
                          size="sm"
                          variant={sectionIdx === currentSectionIndex && qIdx === currentQuestionIndex ? "default" : "outline"}
                          onClick={() => {
                            setCurrentSectionIndex(sectionIdx);
                            setCurrentQuestionIndex(qIdx);
                          }}
                        >
                          {qIdx + 1}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}