import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { auth } from '@/lib/auth'
import { BookOpen, Headphones, Mic, PenTool, PlayCircle, TrendingUp } from 'lucide-react'
import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

/**
 * Render the PTE Core Dashboard server component.
 *
 * Redirects to '/sign-in' when no authenticated session is found.
 *
 * @returns The dashboard React element containing overview statistics, quick practice module links, and mock test actions.
 */
export default async function PTECoreDashboard() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect('/sign-in')
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">PTE Core Dashboard</h1>
        <p className="text-muted-foreground">
          Track your progress, practice skills, and take mock tests to achieve your target score for PTE Core.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Average across all attempts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Completed</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Total mock tests taken</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 Days</div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions Practiced</CardTitle>
            <PenTool className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Total questions answered</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Quick Practice</CardTitle>
            <CardDescription>
              Select a module to start practicing immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/pte/core/practice?tab=speaking" className="block">
                <div className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                  <Mic className="h-8 w-8 mb-2 text-primary" />
                  <span className="font-medium">Speaking</span>
                </div>
              </Link>
              <Link href="/pte/core/practice?tab=writing" className="block">
                <div className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                  <PenTool className="h-8 w-8 mb-2 text-primary" />
                  <span className="font-medium">Writing</span>
                </div>
              </Link>
              <Link href="/pte/core/practice?tab=reading" className="block">
                <div className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                  <BookOpen className="h-8 w-8 mb-2 text-primary" />
                  <span className="font-medium">Reading</span>
                </div>
              </Link>
              <Link href="/pte/core/practice?tab=listening" className="block">
                <div className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                  <Headphones className="h-8 w-8 mb-2 text-primary" />
                  <span className="font-medium">Listening</span>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Mock Tests</CardTitle>
            <CardDescription>
              Simulate the real exam experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Full Mock Test</span>
                <span className="text-xs text-muted-foreground">2 hours</span>
              </div>
              <Link href="/pte/core/mocktest">
                <Button className="w-full">Start Mock Test</Button>
              </Link>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sectional Test</span>
                <span className="text-xs text-muted-foreground">30-60 mins</span>
              </div>
              <Link href="/pte/core/mocktest">
                <Button variant="outline" className="w-full">View Sectional Tests</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}