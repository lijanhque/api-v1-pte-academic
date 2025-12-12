export interface MockTestSection {
  name: 'Speaking' | 'Writing' | 'Reading' | 'Listening'
  score: number
  questionsAttempted: number
  totalQuestions: number
  timeSpent: number // in seconds
}

export interface MockTest {
  id: string
  title: string
  date: string
  status: 'pending' | 'in_progress' | 'completed' | 'reviewed'
  score: number | { overall: number }
  duration: number // in minutes
  sections: MockTestSection[]
  createdAt: string
  updatedAt: string
}

// Static mock data - dates are relative placeholders
export function generateMockTestData(): MockTest[] {
  return [
    {
      id: 'mock-test-1',
      title: 'PTE Academic Practice Test 1',
      date: '2025-12-04',
      status: 'completed',
      score: 72,
      duration: 180,
      sections: [
        { name: 'Speaking', score: 70, questionsAttempted: 5, totalQuestions: 5, timeSpent: 1800 },
        { name: 'Writing', score: 75, questionsAttempted: 2, totalQuestions: 2, timeSpent: 3000 },
        { name: 'Reading', score: 73, questionsAttempted: 5, totalQuestions: 5, timeSpent: 1920 },
        { name: 'Listening', score: 70, questionsAttempted: 5, totalQuestions: 5, timeSpent: 2400 },
      ],
      createdAt: '2025-12-04T10:00:00.000Z',
      updatedAt: '2025-12-04T13:00:00.000Z',
    },
    {
      id: 'mock-test-2',
      title: 'PTE Academic Practice Test 2',
      date: '2025-11-27',
      status: 'reviewed',
      score: { overall: 68 },
      duration: 180,
      sections: [
        { name: 'Speaking', score: 65, questionsAttempted: 5, totalQuestions: 5, timeSpent: 1800 },
        { name: 'Writing', score: 70, questionsAttempted: 2, totalQuestions: 2, timeSpent: 3000 },
        { name: 'Reading', score: 70, questionsAttempted: 5, totalQuestions: 5, timeSpent: 1920 },
        { name: 'Listening', score: 67, questionsAttempted: 5, totalQuestions: 5, timeSpent: 2400 },
      ],
      createdAt: '2025-11-27T10:00:00.000Z',
      updatedAt: '2025-11-27T13:00:00.000Z',
    },
    {
      id: 'mock-test-3',
      title: 'PTE Academic Practice Test 3',
      date: '2025-11-20',
      status: 'completed',
      score: 75,
      duration: 180,
      sections: [
        { name: 'Speaking', score: 73, questionsAttempted: 5, totalQuestions: 5, timeSpent: 1800 },
        { name: 'Writing', score: 78, questionsAttempted: 2, totalQuestions: 2, timeSpent: 3000 },
        { name: 'Reading', score: 76, questionsAttempted: 5, totalQuestions: 5, timeSpent: 1920 },
        { name: 'Listening', score: 73, questionsAttempted: 5, totalQuestions: 5, timeSpent: 2400 },
      ],
      createdAt: '2025-11-20T10:00:00.000Z',
      updatedAt: '2025-11-20T13:00:00.000Z',
    },
    {
      id: 'mock-test-4',
      title: 'PTE Academic Full Mock',
      date: '2025-12-11',
      status: 'pending',
      score: 0,
      duration: 180,
      sections: [
        { name: 'Speaking', score: 0, questionsAttempted: 0, totalQuestions: 5, timeSpent: 0 },
        { name: 'Writing', score: 0, questionsAttempted: 0, totalQuestions: 2, timeSpent: 0 },
        { name: 'Reading', score: 0, questionsAttempted: 0, totalQuestions: 5, timeSpent: 0 },
        { name: 'Listening', score: 0, questionsAttempted: 0, totalQuestions: 5, timeSpent: 0 },
      ],
      createdAt: '2025-12-11T10:00:00.000Z',
      updatedAt: '2025-12-11T10:00:00.000Z',
    },
  ]
}

export function getMockTestById(id: string): MockTest | undefined {
  return generateMockTestData().find((test) => test.id === id)
}

export function getCompletedMockTests(): MockTest[] {
  return generateMockTestData().filter(
    (test) => test.status === 'completed' || test.status === 'reviewed'
  )
}

export function getPendingMockTests(): MockTest[] {
  return generateMockTestData().filter(
    (test) => test.status === 'pending' || test.status === 'in_progress'
  )
}
