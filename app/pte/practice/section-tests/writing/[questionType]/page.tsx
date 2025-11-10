import { initialCategories } from "@/lib/pte/data";
import { redirect } from "next/navigation";

interface PageProps {
  params: {
    category: string;
  };
}

export default function WritingCategoryPage({ params }: PageProps) {
  const { category } = params;

  // Find the writing parent category
  const writingCategory = initialCategories.find(cat => cat.code === category && cat.parent === null);
  
  if (!writingCategory || writingCategory.id !== 7) { // 7 is the ID for Writing parent category
    // Redirect to the main writing page if invalid
    redirect('/academic/pte-practice-test/writing');
  }

  // Validate that questionType is one of the writing subcategories
  const validQuestionTypes = initialCategories
    .filter(cat => cat.parent === 7) // Filter writing subcategories
    .map(cat => cat.code);
  
  if (!validQuestionTypes.includes(category)) {
    // Redirect to the first valid writing question type
    const firstQuestionType = validQuestionTypes[0];
    if (firstQuestionType) {
      redirect(`/academic/pte-practice-test/writing/${firstQuestionType}`);
    } else {
      // If no valid question types found, redirect back to practice home
      redirect('/academic/pte-practice-test');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">PTE Writing Practice</h1>
      </div>
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Writing Practice - {category}</h2>
        <p className="text-gray-600">This section is under development.</p>
      </div>
    </div>
  );
}