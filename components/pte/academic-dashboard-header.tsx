import { User } from '@/lib/db/schema';
import Image from 'next/image';
import { Calendar, Target } from 'lucide-react';

interface AcademicDashboardHeaderProps {
  user: User;
}

export function AcademicDashboardHeader({ user }: AcademicDashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">Academic Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.name}. Here's your academic progress.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Target className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm text-muted-foreground">Target Score</p>
            <p className="font-semibold">{user.targetScore ?? 65}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <Calendar className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm text-muted-foreground">Exam Date</p>
            <p className="font-semibold">
              {user.examDate ? new Date(user.examDate).toLocaleDateString() : 'Not set'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}