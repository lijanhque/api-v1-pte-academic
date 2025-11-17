import { useEffect, useState } from 'react';

export default function WritingPracticePage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch writing questions from API
  useEffect(() => {
    const fetchWritingQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/writing/questions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setQuestions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching writing questions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWritingQuestions();
  }, []);

}