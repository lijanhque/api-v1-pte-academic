import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AcademicPracticeHeader } from "@/components/pte/practice-header";
import QuestionsTable from "@/components/pte/questions-table";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { initialCategories } from "@/lib/pte/data";
import { Star } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SortableTableHeader } from "@/components/ui/sortable-table-header";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  categorizeQuestions,
  fetchListingQuestions,
  getCurrentMonthName,
} from "@/lib/pte/listing-helpers";


type Params = {
  params: Promise<{ section: string; questionType: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const S_CODE_TO_SPEAKING: Record<string, string> = {
  // speaking codes -> API SpeakingType
  s_read_aloud: "read_aloud",
  s_repeat_sentence: "repeat_sentence",
  s_describe_image: "describe_image",
  s_retell_lecture: "retell_lecture",
  s_short_question: "answer_short_question",
  s_summarize_group_discussion: "summarize_group_discussion",
  s_respond_situation_academic: "respond_to_a_situation",
};

export default async function PracticeListPage(props: Params) {
  const searchParams = await props.searchParams;
  const { section: rawSection, questionType } = await props.params;
  const section = (rawSection ?? "").toLowerCase();

  // URL Alias mapping for legacy/pretty URLs
  const URL_ALIAS: Record<string, string> = {
    'read-aloud': 's_read_aloud',
  };

  const resolvedType = URL_ALIAS[questionType] || questionType;

  // Validate questionType exists in known categories
  const typeCat = initialCategories.find((cat) => cat.code === resolvedType);
  if (!typeCat) notFound();

  // Validate parent mapping to section
  const parentCat = initialCategories.find((cat) => cat.id === typeCat.parent);
  if (!parentCat || parentCat.code !== section) notFound();

  const currentMonth = getCurrentMonthName();

  // Helper to render the content with Tabs
  const renderContent = (data: any, section: string, displayType: string) => {
    const { all, weekly, monthly } = categorizeQuestions(data.items);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <AcademicPracticeHeader section={section} showFilters={true} />

          <div className="mt-6">
            <Tabs defaultValue="all">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Questions</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly Prediction</TabsTrigger>
                  <TabsTrigger value="monthly">{currentMonth} Prediction</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all">
                <QuestionsTable
                  rows={all}
                  section={section as any}
                  questionType={displayType}
                />
              </TabsContent>
              <TabsContent value="weekly">
                <QuestionsTable
                  rows={weekly}
                  section={section as any}
                  questionType={displayType}
                />
              </TabsContent>
              <TabsContent value="monthly">
                <QuestionsTable
                  rows={monthly}
                  section={section as any}
                  questionType={displayType}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-4">
            {/* Pagination is handled by the QuestionsTable or external pagination component. 
                 The original dynamic page had explicit Pagination. 
                 We should probably keep it, but put it outside tabs or inside?
                 The tabs filter the CURRENT page. Pagination changes the page.
                 So Pagination should be outside.
             */}
            <Pagination>
              <PaginationContent>
                {data.page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      size="default"
                      href={`/pte/academic/practice/${section}/${questionType}?page=${data.page - 1
                        }`}
                    />
                  </PaginationItem>
                )}
                {Array.from({ length: Math.ceil(data.total / data.pageSize) }, (_, i) => i + 1).map(
                  (p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        size="default"
                        href={`/pte/academic/practice/${section}/${questionType}?page=${p}`}
                        isActive={p === data.page}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                {data.page < Math.ceil(data.total / data.pageSize) && (
                  <PaginationItem>
                    <PaginationNext
                      size="default"
                      href={`/pte/academic/practice/${section}/${questionType}?page=${data.page + 1
                        }`}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    );
  };

  // Speaking branch
  if (section === "speaking") {
    const speakingType = S_CODE_TO_SPEAKING[resolvedType];
    if (!speakingType) notFound();

    const data = await fetchListingQuestions("speaking", speakingType, searchParams);
    return renderContent(data, "speaking", questionType);
  }

  // Writing branch
  if (section === "writing") {
    const writingTypeMap: Record<string, string> = {
      w_summarize_text: "summarize_written_text",
      w_essay: "write_essay",
    };
    const writingType = writingTypeMap[resolvedType];
    if (!writingType) notFound();

    const data = await fetchListingQuestions("writing", writingType, searchParams);
    return renderContent(data, "writing", questionType);
  }

  // Reading branch
  if (section === "reading") {
    const readingTypeMap: Record<string, string> = {
      rw_fib: "reading_writing_fill_blanks",
      r_mcq_multiple: "multiple_choice_multiple",
      r_reorder_paragraphs: "reorder_paragraphs",
      r_fib: "fill_in_blanks",
      r_mcq_single: "multiple_choice_single",
    };
    const readingType = readingTypeMap[resolvedType];
    if (!readingType) notFound();

    const data = await fetchListingQuestions("reading", readingType, searchParams);
    return renderContent(data, "reading", questionType);
  }

  // Listening branch
  if (section === "listening") {
    const listeningTypeMap: Record<string, string> = {
      l_summarize_text: "summarize_spoken_text",
      l_mcq_multiple: "multiple_choice_multiple",
      l_fib: "fill_in_blanks",
      l_highlight_correct_summary: "highlight_correct_summary",
      l_mcq_single: "multiple_choice_single",
      l_select_missing_word: "select_missing_word",
      l_highlight_incorrect_words: "highlight_incorrect_words",
      l_write_from_dictation: "write_from_dictation",
    };
    const listeningType = listeningTypeMap[resolvedType];
    if (!listeningType) notFound();

    const data = await fetchListingQuestions("listening", listeningType, searchParams);
    return renderContent(data, "listening", questionType);
  }

  return notFound();
}
