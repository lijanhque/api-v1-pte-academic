'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface AcademicPerformanceData {
  section: string;
  score: number;
}

interface AcademicPerformanceChartProps {
  data: AcademicPerformanceData[];
}

const COLORS = ['#10b981', '#8b5cf6', '#f97316', '#ef4444'];

export function AcademicPerformanceChart({ data }: AcademicPerformanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance by Section</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="section" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value) => [`${value}`, 'Score']}
                labelFormatter={(label) => `Section: ${label}`}
              />
              <Bar dataKey="score" name="Score">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}