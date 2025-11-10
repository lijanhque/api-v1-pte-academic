import { initialCategories } from "@/lib/pte/data";
import { redirect } from "next/navigation";

interface PageProps {
  params: {
    category: string;
  };
}

export default function ReadingCategoryPage({ params }: PageProps) {
  const { category } = params;

  // Find the reading parent category
  const readingCategory = initialCategories.find(cat => cat.code === category && cat.parent === null);
  
  if (!readingCategory || readingCategory.id !== 10) { // 10 is the ID for Reading parent category
    // Redirect to the main reading page if invalid
    redirect('/academic/pte-practice-test/reading');
  }

  // Validate that questionType is one of the reading subcategories
  const validQuestionTypes = initialCategories
    .filter(cat => cat.parent === 10) // Filter reading subcategories
    .map(cat => cat.code);
  
  if (!validQuestionTypes.includes(category)) {
    // Redirect to the first valid reading question type
    const firstQuestionType = validQuestionTypes[0];
    if (firstQuestionType) {
      redirect(`/academic/pte-practice-test/reading/${firstQuestionType}`);
    } else {
      // If no valid question types found, redirect back to practice home
      redirect('/academic/pte-practice-test');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">PTE Reading Practice</h1>
      </div>
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Reading Practice - {category}</h2>
        <p className="text-gray-600">This section is under development.</p>
      </div>
    </div>
  );
}