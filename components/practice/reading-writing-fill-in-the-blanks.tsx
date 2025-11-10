import { useState } from 'react';

interface ReadingWritingFillInTheBlanksProps {
  text: string;
  blanks: { id: string; correctAnswer: string; options: string[] }[];
  onComplete?: (answers: Record<string, string>) => void;
}

export function ReadingWritingFillInTheBlanks({ text, blanks, onComplete }: ReadingWritingFillInTheBlanksProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(
    blanks.reduce((acc, blank) => ({ ...acc, [blank.id]: '' }), {})
  );

  const handleAnswerChange = (blankId: string, value: string) => {
    const newAnswers = { ...answers, [blankId]: value };
    setAnswers(newAnswers);
  };

  // Split text to insert input fields at blank positions
  const textParts = text.split(/\[BLANK\]|\[\s*__+\s*\]/); // Split on various blank patterns

  return (
    <div className="space-y-6">
      <div className="bg-muted p-4 rounded-lg">
        {textParts.map((part, index) => (
          <span key={index}>
            {part}
            {index < blanks.length && (
              <input
                type="text"
                value={answers[blanks[index].id] || ''}
                onChange={(e) => handleAnswerChange(blanks[index].id, e.target.value)}
                placeholder={`Blank ${index + 1}`}
                className="mx-1 p-1 border rounded text-sm w-32"
              />
            )}
          </span>
        ))}
      </div>

      <div className="space-y-2">
        {blanks.map((blank, idx) => (
          <div key={blank.id} className="flex items-center gap-2">
            <label className="text-sm font-medium">Blank {idx + 1}:</label>
            <input
              type="text"
              value={answers[blank.id] || ''}
              onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
              placeholder="Type your answer..."
              className="flex-1 p-2 border rounded"
            />
          </div>
        ))}
      </div>
    </div>
  );
}