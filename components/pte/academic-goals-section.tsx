'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { CheckCircle, Circle, Target } from 'lucide-react';

interface AcademicGoal {
  id: number;
  title: string;
  current: number;
  target: number;
  status: 'completed' | 'in-progress';
}

interface AcademicGoalsSectionProps {
  goals: AcademicGoal[];
  userTargetScore: number;
}

export function AcademicGoalsSection({ goals, userTargetScore }: AcademicGoalsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Academic Goals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {goals.map((goal) => (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{goal.title}</h3>
                <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                  {goal.status === 'completed' ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                <span className="text-sm text-muted-foreground w-12">
                  {goal.current}/{goal.target}
                </span>
              </div>
              {goal.status === 'completed' ? (
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Goal achieved!</span>
                </div>
              ) : (
                <div className="flex items-center text-blue-600 text-sm">
                  <Circle className="h-4 w-4 mr-1" />
                  <span>{goal.target - goal.current} points to go</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}