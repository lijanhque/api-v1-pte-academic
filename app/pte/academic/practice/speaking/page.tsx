import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, Volume2, Image, Radio, MessageCircle, Users, UserCheck } from 'lucide-react'


const speakingTypes = [
  {
    slug: 'read-aloud',
    title: 'Read Aloud',
    description: 'Read a text aloud with clear pronunciation',
    icon: Mic,
    color: 'bg-blue-500',
  },
  {
    slug: 'repeat-sentence',
    title: 'Repeat Sentence',
    description: 'Listen and repeat the sentence exactly',
    icon: Volume2,
    color: 'bg-green-500',
  },
  {
    slug: 'describe-image',
    title: 'Describe Image',
    description: 'Describe an image in detail',
    icon: Image,
    color: 'bg-purple-500',
  },
  {
    slug: 'retell-lecture',
    title: 'Re-tell Lecture',
    description: 'Listen to a lecture and retell it',
    icon: Radio,
    color: 'bg-orange-500',
  },
  {
    slug: 'answer-short-question',
    title: 'Answer Short Question',
    description: 'Listen and answer with a word or phrase',
    icon: MessageCircle,
    color: 'bg-pink-500',
  },
  {
    slug: 'summarize-group-discussion',
    title: 'Summarize Group Discussion',
    description: 'Summarize a group discussion',
    icon: Users,
    color: 'bg-teal-500',
  },
  {
    slug: 'respond-to-situation',
    title: 'Respond to Situation',
    description: 'Respond appropriately to a situation',
    icon: UserCheck,
    color: 'bg-indigo-500',
  },
]

export default function SpeakingPracticePage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Mic className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Speaking Practice</h1>
          <p className="text-muted-foreground">
            Practice all 7 PTE Academic speaking question types
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {speakingTypes.map((type) => (
          <Link key={type.slug} href={`/pte/academic/practice/speaking/${type.slug}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className={`p-3 rounded-lg ${type.color}`}>
                  <type.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{type.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{type.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
