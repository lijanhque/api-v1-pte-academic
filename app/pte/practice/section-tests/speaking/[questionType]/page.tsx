import { initialCategories } from "@/lib/pte/data";
import { redirect } from "next/navigation";
import SpeakingPracticePage from "./page";

interface PageProps {
  params: {
    category: string;
    questionType: string;
  };
}

export default function SpeakingQuestionTypePage({ params }: PageProps) {
  const { category, questionType } = params;

  // Find the speaking parent category
  const speakingCategory = initialCategories.find(cat => cat.code === category && cat.parent === null);
  
  if (!speakingCategory || speakingCategory.id !== 1) { // 1 is the ID for Speaking parent category
    // Redirect to the main speaking page if invalid
    redirect('/academic/pte-practice-test/speaking');
  }

  // Validate that questionType is one of the speaking subcategories
  const validQuestionTypes = initialCategories
    .filter(cat => cat.parent === 1) // Filter speaking subcategories
    .map(cat => cat.code);
  
  if (!validQuestionTypes.includes(questionType)) {
    // Redirect to the first valid speaking question type
    const firstQuestionType = validQuestionTypes[0];
    if (firstQuestionType) {
      redirect(`/academic/pte-practice-test/speaking/${firstQuestionType}`);
    } else {
      // If no valid question types found, redirect back to practice home
      redirect('/academic/pte-practice-test');
    }
  }

  // Render the speaking practice page with the questionType as category
  return <SpeakingPracticePage params={{ category: questionType }} />;
}