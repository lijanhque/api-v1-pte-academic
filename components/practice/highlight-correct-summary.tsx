import { useState } from 'react';

interface HighlightCorrectSummaryProps {
  summaryTexts: { id: string; text: string; isCorrect: boolean }[];
  question: string;
  onComplete?: (selectedId: string | null) => void;
}

export function HighlightCorrectSummary({ summaryTexts, question, onComplete }: HighlightCorrectSummaryProps) {
  const [selectedSummary, setSelectedSummary] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedSummary(id === selectedSummary ? null : id);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">{question}</h3>
      
      <div className="space-y-3">
        {summaryTexts.map((summary) => (
          <div
            key={summary.id}
            onClick={() => handleSelect(summary.id)}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedSummary === summary.id
                ? 'border-primary bg-primary/10'
                : 'hover:bg-muted'
            }`}
          >
            <div className="flex items-start">
              <input
                type="radio"
                checked={selectedSummary === summary.id}
                onChange={() => {}}
                className="mt-1 mr-3"
              />
              <p>{summary.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}