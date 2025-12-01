import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Mic, PenTool, BookOpen, Headphones } from 'lucide-react'

/**
 * Renders the PTE Core Practice page with cards for Speaking, Writing, Reading, and Listening.
 *
 * Each card displays an icon, title, short description, and a "Start Practice" button that links to the section.
 *
 * @returns The React element for the page containing a header and a responsive grid of practice section cards.
 */
export default function CorePracticePage() {
  const sections = [
    { name: 'Speaking', icon: Mic, href: '/pte/core/practice/speaking', color: 'text-blue-600' },
    { name: 'Writing', icon: PenTool, href: '/pte/core/practice/writing', color: 'text-green-600' },
    { name: 'Reading', icon: BookOpen, href: '/pte/core/practice/reading', color: 'text-purple-600' },
    { name: 'Listening', icon: Headphones, href: '/pte/core/practice/listening', color: 'text-orange-600' },
  ]

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">PTE Core Practice</h1>
        <p className="text-muted-foreground">
          Practice by section to improve your skills for PTE Core.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {sections.map((section) => (
          <Link key={section.name} href={section.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <section.icon className={`h-12 w-12 mx-auto mb-2 ${section.color}`} />
                <CardTitle>{section.name}</CardTitle>
                <CardDescription>Practice {section.name.toLowerCase()} questions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Start Practice
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}