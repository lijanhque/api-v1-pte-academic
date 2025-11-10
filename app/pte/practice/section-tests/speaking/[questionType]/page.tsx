import SpeakingPracticePage from "../page";
import { initialCategories } from "@/lib/pte/data";

// Next 16: pre-render dynamic segment with generateStaticParams
export async function generateStaticParams() {
  return initialCategories
    .filter((c) => c.parent === 1) // Speaking children
    .map((c) => ({ questionType: c.code }));
}

export default async function SpeakingQuestionTypePage({
  params,
}: {
  params: Promise<{ questionType: string }>;
}) {
  const { questionType } = await params;
  // Reuse the parent section page and set the active tab via params
  return <SpeakingPracticePage params={{ category: questionType }} />;
}