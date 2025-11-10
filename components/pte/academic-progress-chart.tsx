'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface AcademicProgressData {
  month: string;
  score: number;
}

interface AcademicProgressChartProps {
  data: AcademicProgressData[];
}

export function AcademicProgressChart({ data }: AcademicProgressChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value) => [`${value}`, 'Score']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Bar dataKey="score" fill="#3b82f6" name="Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}