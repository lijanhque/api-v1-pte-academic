'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Mic, Volume2, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

// Define types for our speaking questions
type SpeakingQuestion = {
  id: string;
  title: string;
  description: string;
  instructions: string;
  example?: string;
  tips?: string[];
  duration: number; // in seconds
  category: string;
};

type SpeakingTab = {
  id: string;
  title: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
  questions: SpeakingQuestion[];
};

// Mock data for PTE Speaking questions
const speakingData: SpeakingTab[] = [
  {
    id: 'read-aloud',
    title: 'Read Aloud',
    shortName: 'RA',
    description: 'Please examine the text provided below. You are required to read it out loud as naturally as you can. Remember, you only have 40 seconds to complete this task.',
    icon: 'https://sgp1.digitaloceanspaces.com/liilab/quizbit/media/icons/s_read_aloud_production.png',
    color: '#ED5D5C',
    questions: [
      {
        id: 'ra-1',
        title: 'Sample Text for Reading - RA1',
        description: 'Read the following text aloud with proper intonation and rhythm.',
        instructions: 'You will see a text on the screen. Read it aloud clearly and naturally.',
        example: 'The Australian government has announced a new initiative to improve education outcomes across the country...',
        tips: [
          'Focus on fluency and pronunciation',
          'Pay attention to punctuation',
          'Maintain a natural pace'
        ],
        duration: 40,
        category: 'read-aloud'
      },
      {
        id: 'ra-2',
        title: 'Sample Text for Reading - RA2',
        description: 'Another text for reading aloud practice.',
        instructions: 'You will see a text on the screen. Read it aloud clearly and naturally.',
        example: 'Climate change continues to be one of the most pressing issues facing our planet today...',
        tips: [
          'Focus on fluency and pronunciation',
          'Pay attention to punctuation',
          'Maintain a natural pace'
        ],
        duration: 40,
        category: 'read-aloud'
      }
    ]
  },
  {
    id: 'repeat-sentence',
    title: 'Repeat Sentence',
    shortName: 'RS',
    description: 'You\'re about to hear a sentence. Please repeat it exactly as you hear it. Keep in mind, you will only hear the sentence one time.',
    icon: 'https://sgp1.digitaloceanspaces.com/liilab/quizbit/media/icons/s_repeat_sentence_production.png',
    color: '#FF6668',
    questions: [
      {
        id: 'rs-1',
        title: 'Sentence to Repeat - RS1',
        description: 'Listen to the sentence and repeat it exactly as heard.',
        instructions: 'You will hear a sentence once. Repeat it exactly as you heard it.',
        example: 'The economic benefits of renewable energy are becoming increasingly apparent.',
        tips: [
          'Listen carefully to every word',
          'Focus on pronunciation',
          'Try to remember the sentence structure'
        ],
        duration: 15,
        category: 'repeat-sentence'
      }
    ]
  },
  {
    id: 'describe-image',
    title: 'Describe Image',
    shortName: 'DI',
    description: 'Please examine the image provided below. You have 25 seconds to prepare, then speak into the microphone and describe in detail what you see in the image. Remember, you\'ll have 40 seconds to give your complete response.',
    icon: 'https://sgp1.digitaloceanspaces.com/liilab/quizbit/media/icons/s_describe_image_production.png',
    color: '#FF7747',
    questions: [
      {
        id: 'di-1',
        title: 'Image Description Practice - DI1',
        description: 'Examine the image and describe it in detail.',
        instructions: 'You have 25 seconds to prepare, then 40 seconds to describe the image.',
        example: 'You will see an image of a city park with people jogging and children playing.',
        tips: [
          'Organize your description logically',
          'Use descriptive language',
          'Focus on main elements first'
        ],
        duration: 65, // 25 prep + 40 speaking
        category: 'describe-image'
      }
    ]
  },
  {
    id: 'retell-lecture',
    title: 'Retell Lecture',
    shortName: 'RL',
    description: 'You\'re going to hear a lecture. After listening to it, you\'ll have 10 seconds to prepare. Then, please speak into the microphone and summarise what you\'ve just heard from the lecture in your own words. Remember, you\'ll have 40 seconds to provide your response.',
    icon: 'https://sgp1.digitaloceanspaces.com/liilab/quizbit/media/icons/s_retell_lecture_production.png',
    color: '#FEAB33',
    questions: [
      {
        id: 'rl-1',
        title: 'Lecture to Retell - RL1',
        description: 'Listen to the lecture and retell it in your own words.',
        instructions: 'Listen to the lecture, then summarize it with 10 seconds prep time.',
        example: 'You will hear a lecture about the impact of artificial intelligence on job markets.',
        tips: [
          'Take mental notes of key points',
          'Organize your summary logically',
          'Use your own words when retelling'
        ],
        duration: 50, // 10 prep + 40 speaking
        category: 'retell-lecture'
      }
    ]
  },
  {
    id: 'answer-short-question',
    title: 'Answer Short Question',
    shortName: 'ASQ',
    description: 'You\'re about to hear a question. Please provide a concise and simple answer. In many cases, just one or a few words will suffice.',
    icon: 'https://sgp1.digitaloceanspaces.com/liilab/quizbit/media/icons/s_short_question_production.png',
    color: '#FCCC3A',
    questions: [
      {
        id: 'asq-1',
        title: 'Short Question - ASQ1',
        description: 'Listen and answer the question concisely.',
        instructions: 'You will hear a question. Answer it directly and concisely.',
        example: 'What is the capital of Australia?',
        tips: [
          'Answer directly and concisely',
          'Listen carefully to the question',
          'Provide the essential information'
        ],
        duration: 10,
        category: 'answer-short-question'
      }
    ]
  },
  {
    id: 'respond-situation',
    title: 'Respond to a Situation',
    shortName: 'RTS-A',
    description: 'Listen to and read a description of a situation. You will have 10 seconds to think about your answer. Then you will hear a beep. You will have 40 seconds to answer the question. Please answer as completely as you can.',
    icon: 'https://sgp1.digitaloceanspaces.com/liilab/quizbit/media/icons/respond_to_a_situation_academic.png',
    color: '#F97962',
    questions: [
      {
        id: 'rts-1',
        title: 'Situation Response - RTS1',
        description: 'Listen to the situation and respond appropriately.',
        instructions: 'Listen to the situation, prepare for 10 seconds, then respond for 40 seconds.',
        example: 'You are planning a team meeting. Describe how you would organize it.',
        tips: [
          'Address all aspects of the situation',
          'Use appropriate language',
          'Structure your response clearly'
        ],
        duration: 50, // 10 prep + 40 speaking
        category: 'respond-situation'
      }
    ]
  }
];

export default function SpeakingPractice({ category }: { category: string }) {
  const [activeTab, setActiveTab] = useState(category);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);

  // Get the current tab data
  const currentTab = speakingData.find(tab => tab.id === activeTab) || speakingData[0];
  const currentQuestion = currentTab.questions[currentQuestionIndex];

  // Handle starting the question
  const startQuestion = () => {
    // Simulate progress
    let currentProgress = 0;
    const timer = setInterval(() => {
      currentProgress += 1;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(timer);
      }
    }, currentQuestion.duration * 10); // Adjust interval based on question duration
  };

  // Handle recording
  const toggleRecording = () => {
    setRecording(!recording);
    if (!recording) {
      // Start recording simulation
      console.log('Started recording');
    } else {
      // Stop recording simulation
      console.log('Stopped recording');
    }
  };

  // Handle audio playback
  const playAudio = () => {
    setAudioPlaying(true);
    // Simulate audio playback
    setTimeout(() => {
      setAudioPlaying(false);
    }, 2000);
  };

  // Navigate to next question
  const nextQuestion = () => {
    if (currentQuestionIndex < currentTab.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setProgress(0);
    }
  };

  // Navigate to previous question
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">PTE Speaking Practice</h1>
          <p className="text-muted-foreground">Practice your speaking skills for the PTE Academic test</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {speakingData.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex flex-col items-center">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center mb-1" 
                style={{ backgroundColor: `${tab.color}20` }}
              >
                <span className="text-xs font-medium" style={{ color: tab.color }}>
                  {tab.shortName}
                </span>
              </div>
              <span className="text-xs">{tab.shortName}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {speakingData.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Question Bank */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {tab.questions.map((question, index) => (
                        <div 
                          key={question.id} 
                          className={`p-2 rounded cursor-pointer ${
                            index === currentQuestionIndex 
                              ? 'bg-primary/10 border border-primary' 
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => setCurrentQuestionIndex(index)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Q{index + 1}</span>
                            <span className="text-xs text-muted-foreground truncate">
                              {question.title.substring(0, 30)}...
                            </span>
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
                      <span 
                        className="w-8 h-8 rounded-full flex items-center justify-center" 
                        style={{ backgroundColor: `${tab.color}20` }}
                      >
                        <span style={{ color: tab.color }}>{tab.shortName}</span>
                      </span>
                      <span>{currentQuestion.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Instructions:</h3>
                        <p className="text-muted-foreground">{currentQuestion.instructions}</p>
                      </div>

                      {currentQuestion.example && (
                        <div>
                          <h3 className="font-medium mb-2">Example:</h3>
                          <p className="bg-muted p-3 rounded-md">{currentQuestion.example}</p>
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
                          <span className="text-sm">{Math.round((100 - progress) * currentQuestion.duration / 100)}s</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={playAudio}
                          disabled={audioPlaying}
                        >
                          <Volume2 className="w-4 h-4 mr-2" />
                          {audioPlaying ? 'Playing...' : 'Listen'}
                        </Button>
                        
                        <Button 
                          onClick={toggleRecording}
                          variant={recording ? "destructive" : "default"}
                        >
                          <Mic className={`w-4 h-4 mr-2 ${recording ? 'animate-pulse' : ''}`} />
                          {recording ? 'Stop Recording' : 'Start Recording'}
                        </Button>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button 
                          onClick={prevQuestion} 
                          variant="outline"
                          disabled={currentQuestionIndex === 0}
                        >
                          Previous
                        </Button>
                        
                        <div className="flex gap-2">
                          <Button variant="outline">Save Answer</Button>
                          <Button>Submit Answer</Button>
                        </div>
                        
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
                        <div className="text-sm text-muted-foreground">Fluency</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-500">7.0</div>
                        <div className="text-sm text-muted-foreground">Pronunciation</div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Feedback Summary:</h4>
                      <p className="text-sm text-muted-foreground">
                        Good pronunciation with clear articulation. Work on maintaining a natural rhythm and reducing hesitations.
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