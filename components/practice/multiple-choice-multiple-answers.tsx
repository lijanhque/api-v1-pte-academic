import { useState } from 'react';

interface MultipleChoiceMultipleAnswersProps {
  question: string;
  options: { id: string; text: string }[];
  correctAnswers: string[];
  onComplete?: (selected: string[]) => void;
}

export function MultipleChoiceMultipleAnswers({ question, options, correctAnswers, onComplete }: MultipleChoiceMultipleAnswersProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const toggleOption = (optionId: string) => {
    if (selectedOptions.includes(optionId)) {
      setSelectedOptions(selectedOptions.filter(id => id !== optionId));
    } else {
      setSelectedOptions([...selectedOptions, optionId]);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">{question}</h3>
      
      <div className="space-y-2">
        {options.map((option) => (
          <div 
            key={option.id}
            onClick={() => toggleOption(option.id)}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedOptions.includes(option.id)
                ? 'border-primary bg-primary/10'
                : 'hover:bg-muted'
            }`}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedOptions.includes(option.id)}
                onChange={() => {}}
                className="mr-2"
              />
              <span>{option.text}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-sm text-muted-foreground">
        Select all that apply
      </div>
    </div>
  );
}