'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Users, 
  Trophy,
  Target,
  Play,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { initialCategories } from '@/lib/pte/data';
import useSWR from 'swr';
import { getUserProfile, getTests } from '@/lib/db/queries';
import { User as UserType, PteTest } from '@/lib/db/schema';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data: user, error: userError } = useSWR<UserType>('/api/user', fetcher);
  const { data: tests, error: testsError } = useSWR<PteTest[]>('/api/ptepratice', fetcher);

  // Mock progress data (will be replaced with real data later)
  const speakingProgress = 75;
  const writingProgress = 68;
  const readingProgress = 82;
  const listeningProgress = 71;

  if (userError || testsError) return <div>Failed to load dashboard data.</div>;
  if (!user || !tests) return <div>Loading...</div>;

  // Get user stats
  const completedTests = tests.filter(t => t.isPremium === false).length; // Assuming free tests are "completed" for now
  const avgScore = 0; // Placeholder, needs actual score data
  const bestScore = 0; // Placeholder, needs actual score data
    
  // Get recent activity (using tests for now, needs actual activity data)
  const recentTests = tests.slice(0, 3);
  
  // Get practice stats
  const speakingCategories = initialCategories.filter(cat => cat.parent === 1);
  const writingCategories = initialCategories.filter(cat => cat.parent === 7);
  const readingCategories = initialCategories.filter(cat => cat.parent === 10);
  const listeningCategories = initialCategories.filter(cat => cat.parent === 16);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.name}! Here's your PTE learning overview</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mock Tests</CardTitle>
            <BarChart3 className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTests}</div>
            <p className="text-xs text-gray-500">Available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore}/90</div>
            <p className="text-xs text-gray-500">Across all tests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            <Trophy className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestScore}/90</div>
            <p className="text-xs text-gray-500">Personal best</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-gray-500">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skills Progress */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Skills Progress
              </CardTitle>
              <CardDescription>Track your progress in each PTE skill area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Speaking</span>
                    <span className="text-sm font-medium">{speakingProgress}%</span>
                  </div>
                  <Progress value={speakingProgress} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">Focus: Fluency and pronunciation</div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Writing</span>
                    <span className="text-sm font-medium">{writingProgress}%</span>
                  </div>
                  <Progress value={writingProgress} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">Focus: Grammar and vocabulary</div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Reading</span>
                    <span className="text-sm font-medium">{readingProgress}%</span>
                  </div>
                  <Progress value={readingProgress} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">Focus: Comprehension skills</div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Listening</span>
                    <span className="text-sm font-medium">{listeningProgress}%</span>
                  </div>
                  <Progress value={listeningProgress} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">Focus: Note-taking skills</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest practice sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <div>
                      <div className="font-medium">{test.title}</div>
                      <div className="text-sm text-gray-500">{test.description}</div>
                    </div>
                    <Badge variant={test.isPremium ? "default" : "secondary"}>
                      {test.isPremium ? "Premium" : "Free"}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/pte/mock-tests">View All Tests</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <Link href="/pte/practice">
                  <Play className="w-4 h-4 mr-2" />
                  Start Practice
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/pte/mock-tests">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Take Mock Test
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/pte/analytics">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Scheduled practice times</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Speaking Practice</div>
                    <div className="text-sm text-gray-500">Today, 3:00 PM</div>
                  </div>
                  <Badge variant="secondary">Scheduled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Mock Test #2</div>
                    <div className="text-sm text-gray-500">Tomorrow, 10:00 AM</div>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Achievement */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Achievement Unlocked!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">Perfect Score</div>
                  <div className="text-sm text-gray-600">Scored 90/90 on Reading</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/pte/practice/section-tests/speaking">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Speaking</CardTitle>
              <CardDescription>{speakingCategories.length} modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Progress</span>
                  <span className="text-sm font-medium">{speakingProgress}%</span>
                </div>
                <Progress value={speakingProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/pte/practice/section-tests/writing">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Writing</CardTitle>
              <CardDescription>{writingCategories.length} modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Progress</span>
                  <span className="text-sm font-medium">{writingProgress}%</span>
                </div>
                <Progress value={writingProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/pte/practice/section-tests/reading">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Reading</CardTitle>
              <CardDescription>{readingCategories.length} modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Progress</span>
                  <span className="text-sm font-medium">{readingProgress}%</span>
                </div>
                <Progress value={readingProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/pte/practice/section-tests/listening">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Listening</CardTitle>
              <CardDescription>{listeningCategories.length} modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Progress</span>
                  <span className="text-sm font-medium">{listeningProgress}%</span>
                </div>
                <Progress value={listeningProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}