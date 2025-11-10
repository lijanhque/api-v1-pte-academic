import { notFound } from "next/navigation";
import { initialCategories } from "@/lib/pte/data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, FileText, Volume2 } from "lucide-react";
import { AcademicPracticeHeader } from "@/components/pte/_components/practice/practice-header";

export default function QuestionTypePage({
  params,
}: {
  params: Promise<{ section: string; questionType: string }>;
}) {
  const { section, questionType } = params;
  
  const questionCategory = initialCategories.find(
    (cat) => cat.code === questionType
  );

  if (!questionCategory) {
    notFound();
  }

  const parentCategory = initialCategories.find(
    (cat) => cat.id === questionCategory.parent
  );

  if (!parentCategory || parentCategory.code !== section) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AcademicPracticeHeader 
          section={section} 
          questionType={questionType} 
        />
        
        <div className="mt-6">
          {/* Question Type Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <img
                  src={questionCategory.icon}
                  alt={questionCategory.title}
                  width={64}
                  height={64}
                  className="rounded-lg"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{questionCategory.title}</h1>
                  <Badge variant="secondary" className="text-xs">
                    {questionCategory.short_name}
                  </Badge>
                </div>
                <p className="text-gray-600 mb-4">
                  {questionCategory.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {questionCategory.question_count} questions
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    ~3-4 minutes each
                  </div>
                  <div className="flex items-center gap-1">
                    <Volume2 className="h-4 w-4" />
                    {questionCategory.scoring_type === 'ai' ? 'AI Scored' : 'Auto Scored'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Practice Options */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Play className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Start Practice</h3>
                    <p className="text-sm text-gray-500">Begin with random questions</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Get a mix of questions from this type to practice your skills. 
                  Each session is tailored to help you improve.
                </p>
                <Button className="w-full">
                  Start Practice Session
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Question Bank</h3>
                    <p className="text-sm text-gray-500">Browse all questions</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Browse through all available questions by difficulty level. 
                  Choose specific topics you want to focus on.
                </p>
                <Button variant="outline" className="w-full">
                  Browse Questions
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Practice Tips */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3">Practice Tips</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Take your time to understand each question before answering</li>
              <li>• Practice regularly to build confidence and improve your timing</li>
              <li>• Review your answers and understand the feedback provided</li>
              <li>• Use headphones for listening questions to ensure clear audio</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const childCategories = initialCategories.filter((cat) => cat.parent !== null);
  
  return childCategories.map((category) => {
    const parentCategory = initialCategories.find((cat) => cat.id === category.parent);
    return {
      section: parentCategory?.code || '',
      questionType: category.code,
    };
  });
}