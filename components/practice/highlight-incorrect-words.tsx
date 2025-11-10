import { useState } from 'react';

interface HighlightIncorrectWordsProps {
  text: string;
  incorrectWords: string[]; // List of words that should be highlighted as incorrect
  onComplete?: (selectedWords: string[]) => void;
}

export function HighlightIncorrectWords({ text, incorrectWords, onComplete }: HighlightIncorrectWordsProps) {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  // Split text into words while preserving spaces and punctuation
  const textElements = text.split(/(\s+|[,.!?;:]+)/).map((part, index) => {
    // Skip whitespace/punctuation
    if (/^\s+$/.test(part) || /^[,.!?;:]+$/.test(part)) {
      return part;
    }
    
    // Check if this word is in the incorrect list
    const isIncorrect = incorrectWords.includes(part);
    const isSelected = selectedWords.includes(part + index.toString()); // Adding index to make unique
    
    return (
      <span
        key={index}
        onClick={() => {
          const wordKey = part + index.toString();
          if (selectedWords.includes(wordKey)) {
            setSelectedWords(selectedWords.filter(w => w !== wordKey));
          } else {
            setSelectedWords([...selectedWords, wordKey]);
          }
        }}
        className={`cursor-pointer px-1 rounded ${
          isSelected
            ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'
            : isIncorrect
            ? 'hover:bg-red-100 dark:hover:bg-red-900'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        {part}
      </span>
    );
  });

  return (
    <div className="space-y-4">
      <p className="leading-relaxed">Click on the incorrect words in the passage below:</p>
      
      <div className="p-4 border rounded-lg bg-muted">
        {textElements}
      </div>
      
      <div className="text-sm text-muted-foreground">
        Selected incorrect words: {selectedWords.length}
      </div>
    </div>
  );
}