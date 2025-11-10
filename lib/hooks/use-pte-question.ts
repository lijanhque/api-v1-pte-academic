import { useState, useEffect } from 'react';

// Define TypeScript interfaces
interface PTEQuestion {
  id: string;
  type: string;
  category: string;
  content: any;
  options?: string[];
  correctAnswer?: string | string[];
  userAnswer?: string | string[];
  isAnswered?: boolean;
}

interface UsePTEQuestionReturn {
  question: PTEQuestion | null;
  loading: boolean;
  error: string | null;
  userAnswer: string | string[] | null;
  setUserAnswer: (answer: string | string[]) => void;
  submitAnswer: () => Promise<void>;
  resetQuestion: () => void;
}

export function usePteQuestion(
  questionId: string,
  initialQuestion?: PTEQuestion
): UsePTEQuestionReturn {
  const [question, setQuestion] = useState<PTEQuestion | null>(initialQuestion || null);
  const [userAnswer, setUserAnswer] = useState<string | string[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mock function to fetch question data
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        // This would be an actual API call in a real application
        // For now, we'll use mock data or the initial question
        if (!initialQuestion) {
          // In a real app, you'd fetch from an API here
          // const response = await fetch(`/api/pte-questions/${questionId}`);
          // const data = await response.json();
          // setQuestion(data);
        } else {
          setQuestion(initialQuestion);
        }
      } catch (err) {
        setError('Failed to load question');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (questionId) {
      fetchQuestion();
    }
  }, [questionId, initialQuestion]);

  const submitAnswer = async () => {
    if (!question) return;
    
    try {
      // In a real app, you'd submit the answer to an API
      // const response = await fetch(`/api/pte-questions/${questionId}/submit`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ answer: userAnswer })
      // });
      // const result = await response.json();
      
      // Update question with user answer
      setQuestion(prev => prev ? { ...prev, userAnswer, isAnswered: true } : null);
    } catch (err) {
      setError('Failed to submit answer');
      console.error(err);
    }
  };

  const resetQuestion = () => {
    setUserAnswer(null);
    setError(null);
    if (question) {
      setQuestion({ ...question, userAnswer: undefined, isAnswered: false });
    }
  };

  return {
    question,
    loading,
    error,
    userAnswer,
    setUserAnswer,
    submitAnswer,
    resetQuestion
  };
}

// Also export with the original name to support different import styles
export { usePteQuestion as usePTEQuestion };