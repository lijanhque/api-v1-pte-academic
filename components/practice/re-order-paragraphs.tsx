import { useState } from 'react';

interface ReOrderParagraphsProps {
  paragraphs: string[];
  onComplete?: (correctOrder: number[]) => void;
}

export function ReOrderParagraphs({ paragraphs, onComplete }: ReOrderParagraphsProps) {
  const [orderedParagraphs, setOrderedParagraphs] = useState<number[]>(
    Array.from({ length: paragraphs.length }, (_, i) => i)
  );
  
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    const newOrder = [...orderedParagraphs];
    const [movedItem] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(targetIndex, 0, movedItem);
    
    setOrderedParagraphs(newOrder);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Reorder the paragraphs to form a coherent text
      </div>
      
      {orderedParagraphs.map((index, position) => (
        <div
          key={position}
          draggable
          onDragStart={(e) => handleDragStart(e, position)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, position)}
          className="p-4 border rounded-lg bg-card cursor-move hover:bg-accent"
        >
          <div className="font-medium mb-2">Paragraph {position + 1}</div>
          <div>{paragraphs[index]}</div>
        </div>
      ))}
    </div>
  );
}