import { initialCategories } from "@/lib/pte/data";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{
    questionType: string;
  }>;
};

export default async function ListeningCategoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { questionType } = resolvedParams;

  // Find the listening parent category
  const listeningCategory = initialCategories.find(cat => cat.code === category && cat.parent === null);
  
  if (!listeningCategory || listeningCategory.id !== 16) { // 16 is the ID for Listening parent category
    // Redirect to the main listening page if invalid
    redirect('/academic/pte-practice-test/listening');
  }

  // Validate that questionType is one of the listening subcategories
  const validQuestionTypes = initialCategories
    .filter(cat => cat.parent === 16) // Filter listening subcategories
    .map(cat => cat.code);
  
  if (!validQuestionTypes.includes(category)) {
    // Redirect to the first valid listening question type
    const firstQuestionType = validQuestionTypes[0];
    if (firstQuestionType) {
      redirect(`/academic/pte-practice-test/listening/${firstQuestionType}`);
    } else {
      // If no valid question types found, redirect back to practice home
      redirect('/academic/pte-practice-test');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">PTE Listening Practice</h1>
      </div>
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Listening Practice - {category}</h2>
        <p className="text-gray-600">This section is under development.</p>
      </div>
    </div>
  );
}