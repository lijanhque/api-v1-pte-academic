import { Badge } from '@/components/ui/badge'
// Force dynamic rendering to avoid DB queries during build
export const dynamic = 'force-dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { pteTests, testAttempts } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { Clock, PlayCircle } from 'lucide-react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Fetches all PTE tests that are marked as mock tests.
 *
 * @returns An array of records from `pteTests` where `testType` is `'mock'`
 */
async function getMockTests() {
  return await db.select().from(pteTests).where(eq(pteTests.testType, 'mock'))
}

/**
 * Retrieve a user's PTE test attempt history with associated test metadata.
 *
 * @param userId - The ID of the user whose test history to retrieve
 * @returns An array of records ordered by `startedAt` descending, each containing `id`, `testTitle`, `status`, `score`, `startedAt`, and `completedAt`
 */
async function getTestHistory(userId: string) {
  return await db
    .select({
      id: testAttempts.id,
      testTitle: pteTests.title,
      status: testAttempts.status,
      score: testAttempts.totalScore,
      startedAt: testAttempts.startedAt,
      completedAt: testAttempts.completedAt,
    })
    .from(testAttempts)
    .leftJoin(pteTests, eq(testAttempts.testId, pteTests.id))
    .where(eq(testAttempts.userId, userId))
    .orderBy(desc(testAttempts.startedAt))
}

/**
 * Render the PTE Core mock tests page with tabs for full mock tests, sectional tests, and the user's test history.
 *
 * Redirects to "/sign-in" when there is no authenticated session.
 *
 * @returns The React element for the PTE Core mock tests page.
 */
export default async function CoreMockTestPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect('/sign-in')
  }

  const allMockTests = await getMockTests()
  const fullMocks = allMockTests.filter(t => !t.section)
  const sectionalMocks = allMockTests.filter(t => !!t.section)
  const history = await getTestHistory(session.user.id)

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">PTE Core Mock Tests</h1>
        <p className="text-muted-foreground">
          Take full-length or sectional mock tests to evaluate your readiness for PTE Core.
        </p>
      </div>

      <Tabs defaultValue="full" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="full">Full Mock Tests</TabsTrigger>
          <TabsTrigger value="sectional">Sectional Tests</TabsTrigger>
          <TabsTrigger value="history">Test History</TabsTrigger>
        </TabsList>

        <TabsContent value="full" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {fullMocks.length > 0 ? (
              fullMocks.map((test) => (
                <Card key={test.id}>
                  <CardHeader>
                    <CardTitle>{test.title}</CardTitle>
                    <CardDescription>{test.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        {test.duration} mins
                      </div>
                      <Badge variant={test.isPremium === 'true' ? 'default' : 'secondary'}>
                        {test.isPremium === 'true' ? 'Premium' : 'Free'}
                      </Badge>
                    </div>
                    <Button className="w-full">
                      <PlayCircle className="mr-2 h-4 w-4" /> Start Test
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No full mock tests available at the moment.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sectional" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sectionalMocks.length > 0 ? (
              sectionalMocks.map((test) => (
                <Card key={test.id}>
                  <CardHeader>
                    <CardTitle>{test.title}</CardTitle>
                    <CardDescription>{test.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline" className="capitalize">
                        {test.section}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        {test.duration} mins
                      </div>
                    </div>
                    <Button className="w-full" variant="outline">
                      <PlayCircle className="mr-2 h-4 w-4" /> Start Section
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No sectional tests available at the moment.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Test History</CardTitle>
              <CardDescription>Your recent mock test attempts.</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{attempt.testTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {attempt.startedAt ? new Date(attempt.startedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          variant={
                            attempt.status === 'completed'
                              ? 'default'
                              : attempt.status === 'in_progress'
                              ? 'secondary'
                              : 'destructive'
                          }
                          className="capitalize"
                        >
                          {attempt.status?.replace('_', ' ')}
                        </Badge>
                        {attempt.score && (
                          <span className="font-bold">{attempt.score} pts</span>
                        )}
                        <Button size="sm" variant="ghost">
                          View Report
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No test history found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}