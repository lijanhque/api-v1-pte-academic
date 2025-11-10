'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, TrendingDown, Clock, Target } from 'lucide-react';

interface AcademicStats {
  overallScore: number;
  targetScore: number;
  readingScore: number;
  writingScore: number;
  listeningScore: number;
  speakingScore: number;
  testsCompleted: number;
  studyHours: number;
  streak: number;
}

interface AcademicStatsCardsProps {
  data: AcademicStats;
}

export function AcademicStatsCards({ data }: AcademicStatsCardsProps) {
  const stats = [
    {
      title: 'Overall Score',
      value: data.overallScore,
      icon: <Target className="h-5 w-5 text-blue-600" />,
      change: `Target: ${data.targetScore}`,
      changeType: 'positive',
    },
    {
      title: 'Reading',
      value: data.readingScore,
      icon: <TrendingUp className="h-5 w-5 text-green-600" />,
      change: '+3 from last month',
      changeType: 'positive',
    },
    {
      title: 'Writing',
      value: data.writingScore,
      icon: <TrendingUp className="h-5 w-5 text-purple-600" />,
      change: '+2 from last month',
      changeType: 'positive',
    },
    {
      title: 'Listening',
      value: data.listeningScore,
      icon: <TrendingUp className="h-5 w-5 text-orange-600" />,
      change: '+7 from last month',
      changeType: 'positive',
    },
    {
      title: 'Speaking',
      value: data.speakingScore,
      icon: <TrendingUp className="h-5 w-5 text-red-600" />,
      change: '+4 from last month',
      changeType: 'positive',
    },
    {
      title: 'Tests Completed',
      value: data.testsCompleted,
      icon: <Clock className="h-5 w-5 text-cyan-600" />,
      change: '+2 this week',
      changeType: 'positive',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}