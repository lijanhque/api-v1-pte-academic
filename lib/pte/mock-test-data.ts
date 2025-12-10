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

export function generateMockTestData(): MockTest[] {
  const now = new Date()

  return [
    {
      id: 'mock-test-1',
      title: 'PTE Academic Practice Test 1',
      date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'completed',
      score: 72,
      duration: 180,
      sections: [
        { name: 'Speaking', score: 70, questionsAttempted: 5, totalQuestions: 5, timeSpent: 1800 },
        { name: 'Writing', score: 75, questionsAttempted: 2, totalQuestions: 2, timeSpent: 3000 },
        { name: 'Reading', score: 73, questionsAttempted: 5, totalQuestions: 5, timeSpent: 1920 },
        { name: 'Listening', score: 70, questionsAttempted: 5, totalQuestions: 5, timeSpent: 2400 },
      ],
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-test-2',
      title: 'PTE Academic Practice Test 2',
      date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'reviewed',
      score: { overall: 68 },
      duration: 180,
      sections: [
        { name: 'Speaking', score: 65, questionsAttempted: 5, totalQuestions: 5, timeSpent: 1800 },
        { name: 'Writing', score: 70, questionsAttempted: 2, totalQuestions: 2, timeSpent: 3000 },
        { name: 'Reading', score: 70, questionsAttempted: 5, totalQuestions: 5, timeSpent: 1920 },
        { name: 'Listening', score: 67, questionsAttempted: 5, totalQuestions: 5, timeSpent: 2400 },
      ],
      createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-test-3',
      title: 'PTE Academic Practice Test 3',
      date: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'completed',
      score: 75,
      duration: 180,
      sections: [
        { name: 'Speaking', score: 73, questionsAttempted: 5, totalQuestions: 5, timeSpent: 1800 },
        { name: 'Writing', score: 78, questionsAttempted: 2, totalQuestions: 2, timeSpent: 3000 },
        { name: 'Reading', score: 76, questionsAttempted: 5, totalQuestions: 5, timeSpent: 1920 },
        { name: 'Listening', score: 73, questionsAttempted: 5, totalQuestions: 5, timeSpent: 2400 },
      ],
      createdAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-test-4',
      title: 'PTE Academic Full Mock',
      date: now.toISOString().split('T')[0],
      status: 'pending',
      score: 0,
      duration: 180,
      sections: [
        { name: 'Speaking', score: 0, questionsAttempted: 0, totalQuestions: 5, timeSpent: 0 },
        { name: 'Writing', score: 0, questionsAttempted: 0, totalQuestions: 2, timeSpent: 0 },
        { name: 'Reading', score: 0, questionsAttempted: 0, totalQuestions: 5, timeSpent: 0 },
        { name: 'Listening', score: 0, questionsAttempted: 0, totalQuestions: 5, timeSpent: 0 },
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
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
