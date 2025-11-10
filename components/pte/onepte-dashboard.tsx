'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { initialCategories } from '@/lib/pte/data';
import { BookOpen, FileText, Headphones, Mic, Award } from 'lucide-react';

type SectionKey = 'speaking' | 'writing' | 'reading' | 'listening';

const SECTION_META: Record<SectionKey, { id: number; label: string; icon: React.ReactNode }> = {
  speaking: { id: 1, label: 'Speaking', icon: <Mic className="w-4 h-4" /> },
  writing: { id: 7, label: 'Writing', icon: <FileText className="w-4 h-4" /> },
  reading: { id: 10, label: 'Reading', icon: <BookOpen className="w-4 h-4" /> },
  listening: { id: 16, label: 'Listening', icon: <Headphones className="w-4 h-4" /> },
};

export function OnePTEDashboard() {
  const [activeSection, setActiveSection] = useState<SectionKey>('speaking');

  const items = useMemo(() => {
    const id = SECTION_META[activeSection].id;
    return initialCategories.filter((c) => c.parent === id);
  }, [activeSection]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Start Your PTE Academic Practice Test Online</h1>
        <p className="text-gray-600 mt-1">
          Welcome to your PTE practice hub. Prepare for PTE Academic with targeted practice tests across all sections.
        </p>
      </div>

      <div className="px-6 py-6">
        <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as SectionKey)} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            {(Object.keys(SECTION_META) as SectionKey[]).map((key) => (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                {SECTION_META[key].icon}
                {SECTION_META[key].label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeSection} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((q) => (
                <Link
                  key={q.id}
                  href={`/pte/academic/practice/section-tests/${activeSection}/${q.code}`}
                  className="block"
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 rounded-lg bg-gray-50 p-2">
                          <Image
                            src={q.icon}
                            alt={q.title}
                            width={40}
                            height={40}
                            className="rounded-md"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-base">{q.title}</h3>
                            {q.scoring_type === 'ai' && (
                              <Badge className="bg-yellow-500 text-yellow-900">AI</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{q.description}</p>
                          <div className="mt-3 text-xs text-gray-500">
                            {q.question_count} questions • Code: {q.short_name || q.code}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white rounded-lg p-6 border">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Targeted Practice</h4>
                    <p className="text-gray-600 text-sm">Practice tasks tailored for {SECTION_META[activeSection].label}.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Exam-like Experience</h4>
                    <p className="text-gray-600 text-sm">Timed sections and realistic tasks to build confidence.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border text-center">
              <h3 className="text-lg font-semibold">
                Prepare for <span className="text-blue-600">PTE Core</span> or <span className="text-blue-600">PTE Academic</span>. Start now and get ready for success!
              </h3>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}