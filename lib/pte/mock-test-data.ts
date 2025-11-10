// lib/pte/mock-test-data.ts
import { initialCategories } from './data';
import { MockTestScore } from './scoring';

export interface MockTest {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  date: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'reviewed';
  score?: MockTestScore;
  sections: MockTestSection[];
  createdAt: string;
  updatedAt: string;
}

export interface MockTestSection {
  id: string;
  name: string;
  code: string;
  icon: string;
  color: string;
  duration: number; // in minutes
  questions: MockTestQuestion[];
  score?: number;
  timeSpent?: number; // in seconds
  status: 'not-started' | 'in-progress' | 'completed';
}

export interface MockTestQuestion {
  id: string;
  sectionId: string;
  type: string;
  typeId: string; // matches the code from initialCategories
  title: string;
  content: string;
  instructions: string;
  duration: number; // in seconds
  status: 'not-started' | 'in-progress' | 'completed' | 'reviewed';
  score?: number;
  userAnswer?: string;
  correctAnswer?: string;
  explanation?: string;
}

// Generate mock test data based on initial categories
export function generateMockTestData(): MockTest[] {
  return [
    {
      id: 'mock-test-1',
      title: 'PTE Academic Mock Test #1',
      description: 'Full-length practice test covering all PTE Academic sections',
      duration: 180,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections: [
        {
          id: 'section-speaking-1',
          name: 'Speaking',
          code: 'speaking',
          icon: 'https://sgp1.digitaloceanspaces.com/liilab/quizbit/media/icons/ic-speaking.png',
          color: '#6366f1',
          duration: 30,
          status: 'completed',
          score: 78,
          timeSpent: 1750, // 29 min 10 sec
          questions: [
            {
              id: 'q1',
              sectionId: 'section-speaking-1',
              type: 'Read Aloud',
              typeId: 's_read_aloud',
              title: 'Read Aloud - Sample 1',
              content: 'The Australian government has announced a new initiative to improve education outcomes across the country.',
              instructions: 'You will see a text on the screen. Read it aloud as naturally and clearly as you can.',
              duration: 40,
              status: 'completed',
              score: 82,
              userAnswer: 'Sample response...',
              correctAnswer: 'Exact text',
              explanation: 'Focus on pronunciation and fluency'
            },
            {
              id: 'q2',
              sectionId: 'section-speaking-1',
              type: 'Repeat Sentence',
              typeId: 's_repeat_sentence',
              title: 'Repeat Sentence - Sample 1',
              content: 'The economic benefits of renewable energy are becoming increasingly apparent.',
              instructions: 'You will hear a sentence once. Repeat it exactly as you hear it.',
              duration: 15,
              status: 'completed',
              score: 75,
              userAnswer: 'Sample response...',
              correctAnswer: 'Exact sentence',
              explanation: 'Focus on word stress and intonation'
            }
          ]
        },
        {
          id: 'section-writing-1',
          name: 'Writing',
          code: 'writing',
          icon: 'https://sgp1.digitaloceanspaces.com/liilab/quizbit/media/icons/ic-writing.png',
          color: '#10b981',
          duration: 60,
          status: 'completed',
          score: 82,
          timeSpent: 3500, // 58 min 20 sec
          questions: [
            {
              id: 'wq1',
              sectionId: 'section-writing-1',
              type: 'Summarize Written Text',
              typeId: 'w_summarize_text',
              title: 'Summarize Written Text - Sample 1',
              content: 'Climate change continues to be one of the most pressing issues facing our planet today...',
              instructions: 'Read the passage below and summarize it using only one sentence.',
              duration: 600, // 10 minutes
              status: 'completed',
              score: 78,
              userAnswer: 'Sample summary...',
              correctAnswer: 'Sample correct summary',
              explanation: 'Focus on capturing main points concisely'
            }
          ]
        },
        {
          id: 'section-reading-1',
          name: 'Reading',
          code: 'reading',
          icon: 'https://sgp1.digitaloceanspaces.com/liilab/quizbit/media/icons/ic-reading.png',
          color: '#f59e0b',
          duration: 32,
          status: 'completed',
          score: 85,
          timeSpent: 1850, // 30 min 50 sec
          questions: []
        },
        {
          id: 'section-listening-1',
          name: 'Listening',
          code: 'listening',
          icon: 'https://sgp1.digitaloceanspaces.com/liilab/quizbit/media/icons/ic-listening.png',
          color: '#8b5cf6',
          duration: 40,
          status: 'completed',
          score: 79,
          timeSpent: 2300, // 38 min 20 sec
          questions: []
        }
      ]
    }
  ];
}

export function getMockTestById(id: string): MockTest | undefined {
  const tests = generateMockTestData();
  return tests.find(test => test.id === id);
}

export function getMockTests(): MockTest[] {
  return generateMockTestData();
}