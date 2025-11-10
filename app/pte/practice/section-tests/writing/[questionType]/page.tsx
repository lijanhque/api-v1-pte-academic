import WritingPracticePage from "../page";
import { initialCategories } from "@/lib/pte/data";

// Next 16: pre-render dynamic segment with generateStaticParams
export async function generateStaticParams() {
  return initialCategories
    .filter((c) => c.parent === 7) // Writing children
    .map((c) => ({ questionType: c.code }));
}

export default async function WritingQuestionTypePage({
  params,
}: {
  params: Promise<{ questionType: string }>;
}) {
  const { questionType } = await params;
  return <WritingPracticePage params={{ category: questionType }} />;
}