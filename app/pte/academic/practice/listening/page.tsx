import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Headphones, FileText, CheckCircle, ListChecks, ClipboardList, HelpCircle, AlertTriangle, PenTool } from 'lucide-react'
import Link from 'next/link'

const listeningTypes = [
  {
    slug: 'summarize-spoken-text',
    title: 'Summarize Spoken Text',
    description: 'Listen to a recording and write a summary',
    icon: FileText,
    color: 'bg-blue-500',
  },
  {
    slug: 'multiple-choice-single',
    title: 'Multiple Choice (Single)',
    description: 'Listen and select one correct answer',
    icon: CheckCircle,
    color: 'bg-green-500',
  },
  {
    slug: 'multiple-choice-multiple',
    title: 'Multiple Choice (Multiple)',
    description: 'Listen and select multiple correct answers',
    icon: ListChecks,
    color: 'bg-purple-500',
  },
  {
    slug: 'fill-in-blanks',
    title: 'Fill in the Blanks',
    description: 'Listen and type the missing words',
    icon: ClipboardList,
    color: 'bg-orange-500',
  },
  {
    slug: 'highlight-correct-summary',
    title: 'Highlight Correct Summary',
    description: 'Select the paragraph that best summarizes the recording',
    icon: FileText,
    color: 'bg-pink-500',
  },
  {
    slug: 'select-missing-word',
    title: 'Select Missing Word',
    description: 'Listen and select the word that completes the recording',
    icon: HelpCircle,
    color: 'bg-teal-500',
  },
  {
    slug: 'highlight-incorrect-words',
    title: 'Highlight Incorrect Words',
    description: 'Select words in the transcript that differ from the recording',
    icon: AlertTriangle,
    color: 'bg-red-500',
  },
  {
    slug: 'write-from-dictation',
    title: 'Write from Dictation',
    description: 'Listen and type exactly what you hear',
    icon: PenTool,
    color: 'bg-indigo-500',
  },
]

export default function ListeningPracticePage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-cyan-500/10">
          <Headphones className="h-8 w-8 text-cyan-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Listening Practice</h1>
          <p className="text-muted-foreground">
            Practice all 8 PTE Academic Listening question types
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {listeningTypes.map((type) => {
          const Icon = type.icon
          return (
            <Link key={type.slug} href={`/pte/academic/practice/listening/${type.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${type.color}/10`}>
                      <Icon className={`h-5 w-5 ${type.color.replace('bg-', 'text-').replace('-500', '-600')}`} />
                    </div>
                    <CardTitle className="text-lg">{type.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{type.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
