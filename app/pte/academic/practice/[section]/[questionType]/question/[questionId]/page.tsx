import { notFound } from 'next/navigation'
// Force dynamic rendering to avoid DB queries during build
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db/drizzle'
import {
    speakingQuestions,
    readingQuestions,
    listeningQuestions,
    writingQuestions
} from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Metadata } from 'next'

// Speaking components
import { ReadAloud } from '@/components/pte/speaking/read-aloud'
import { RepeatSentence } from '@/components/pte/speaking/repeat-sentence'
import { DescribeImage } from '@/components/pte/speaking/describe-image'
import { RetellLecture } from '@/components/pte/speaking/retell-lecture'
import { AnswerShortQuestion } from '@/components/pte/speaking/answer-short-question'
import { SummarizeGroupDiscussion } from '@/components/pte/speaking/summarize-group-discussion'
import { RespondToSituation } from '@/components/pte/speaking/respond-to-situation'

// Reading components
import ReadingQuestionClient from '@/components/pte/reading/ReadingQuestionClient'

// Listening components
import ListeningQuestionClient from '@/components/pte/listening/ListeningQuestionClient'

// Writing components
import WritingQuestionClient from '@/components/pte/writing/WritingQuestionClient'

type Params = {
    params: Promise<{ section: string; questionType: string; questionId: string }>
}

const QUESTION_TYPE_MAPPINGS = {
    speaking: {
        's_read_aloud': 'read_aloud',
        's_repeat_sentence': 'repeat_sentence',
        's_describe_image': 'describe_image',
        's_retell_lecture': 'retell_lecture',
        's_short_question': 'answer_short_question',
        's_summarize_group_discussion': 'summarize_group_discussion',
        's_respond_situation_academic': 'respond_to_a_situation',
    },
    writing: {
        'w_summarize_text': 'summarize_written_text',
        'w_essay': 'write_essay',
    },
    reading: {
        'rw_fib': 'reading_writing_fill_blanks',
        'r_mcq_multiple': 'multiple_choice_multiple',
        'r_reorder_paragraphs': 'reorder_paragraphs',
        'r_fib': 'fill_in_blanks',
        'r_mcq_single': 'multiple_choice_single',
    },
    listening: {
        'l_summarize_text': 'summarize_spoken_text',
        'l_mcq_multiple': 'multiple_choice_multiple',
        'l_fib': 'fill_in_blanks',
        'l_highlight_correct_summary': 'highlight_correct_summary',
        'l_mcq_single': 'multiple_choice_single',
        'l_select_missing_word': 'select_missing_word',
        'l_highlight_incorrect_words': 'highlight_incorrect_words',
        'l_write_from_dictation': 'write_from_dictation',
    },
}

export async function generateMetadata(props: Params): Promise<Metadata> {
    const { section, questionId } = await props.params

    let title = 'PTE Practice'
    const sectionTitle = section.charAt(0).toUpperCase() + section.slice(1)

    try {
        if (section === 'speaking') {
            const result = await db
                .select({ title: speakingQuestions.title })
                .from(speakingQuestions)
                .where(eq(speakingQuestions.id, questionId))
                .limit(1)

            if (result[0]) {
                title = `${result[0].title} - PTE ${sectionTitle} Practice`
            }
        } else if (section === 'reading') {
            const result = await db
                .select({ title: readingQuestions.title })
                .from(readingQuestions)
                .where(eq(readingQuestions.id, questionId))
                .limit(1)

            if (result[0]) {
                title = `${result[0].title} - PTE ${sectionTitle} Practice`
            }
        } else if (section === 'listening') {
            const result = await db
                .select({ title: listeningQuestions.title })
                .from(listeningQuestions)
                .where(eq(listeningQuestions.id, questionId))
                .limit(1)

            if (result[0]) {
                title = `${result[0].title} - PTE ${sectionTitle} Practice`
            }
        } else if (section === 'writing') {
            const result = await db
                .select({ title: writingQuestions.title })
                .from(writingQuestions)
                .where(eq(writingQuestions.id, questionId))
                .limit(1)

            if (result[0]) {
                title = `${result[0].title} - PTE ${sectionTitle} Practice`
            }
        }
    } catch (error) {
        console.error('Error generating metadata:', error)
    }

    return {
        title,
        description: `Practice PTE Academic ${section} questions with AI scoring.`,
    }
}

export default async function QuestionPage(props: Params) {
    const { section, questionType, questionId } = await props.params

    // Fetch the question based on section
    let question = null
    let questionTable = null

    if (section === 'speaking') {
        questionTable = speakingQuestions
        const result = await db
            .select()
            .from(speakingQuestions)
            .where(eq(speakingQuestions.id, questionId))
            .limit(1)
        question = result[0]
    } else if (section === 'reading') {
        questionTable = readingQuestions
        const result = await db
            .select()
            .from(readingQuestions)
            .where(eq(readingQuestions.id, questionId))
            .limit(1)
        question = result[0]
    } else if (section === 'listening') {
        questionTable = listeningQuestions
        const result = await db
            .select()
            .from(listeningQuestions)
            .where(eq(listeningQuestions.id, questionId))
            .limit(1)
        question = result[0]
    } else if (section === 'writing') {
        questionTable = writingQuestions
        const result = await db
            .select()
            .from(writingQuestions)
            .where(eq(writingQuestions.id, questionId))
            .limit(1)
        question = result[0]
    }

    if (!question) {
        notFound()
    }

    // Map question type to component
    const mappings = QUESTION_TYPE_MAPPINGS[section as keyof typeof QUESTION_TYPE_MAPPINGS]
    const dbQuestionType = mappings?.[questionType as keyof typeof mappings]

    // Render appropriate component based on section and type
    if (section === 'speaking') {
        switch (dbQuestionType) {
            case 'read_aloud':
                return <ReadAloud question={question} />
            case 'repeat_sentence':
                return <RepeatSentence question={question} />
            case 'describe_image':
                return <DescribeImage question={question} />
            case 'retell_lecture':
                return <RetellLecture question={question} />
            case 'answer_short_question':
                return <AnswerShortQuestion question={question} />
            case 'summarize_group_discussion':
                return <SummarizeGroupDiscussion question={question} />
            case 'respond_to_a_situation':
                return <RespondToSituation question={question} />
            default:
                notFound()
        }
    } else if (section === 'reading') {
        return <ReadingQuestionClient question={question} questionType={dbQuestionType || questionType} />
    } else if (section === 'listening') {
        return <ListeningQuestionClient question={question} questionType={dbQuestionType || questionType} />
    } else if (section === 'writing') {
        return <WritingQuestionClient question={question} questionType={dbQuestionType || questionType} />
    }

    return notFound()
}
