'use client';

import Link from 'next/link';
import { initialCategories } from '@/lib/pte/data';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Home } from 'lucide-react';

type SectionKey = 'speaking' | 'writing' | 'reading' | 'listening';

function getSectionId(section: SectionKey) {
  switch (section) {
    case 'speaking':
      return 1;
    case 'writing':
      return 7;
    case 'reading':
      return 10;
    case 'listening':
      return 16;
  }
}

export interface PracticeHeaderProps {
  section: SectionKey;
  questionTypeCode: string; // e.g. s_read_aloud
}

export default function PracticeHeader({ section, questionTypeCode }: PracticeHeaderProps) {
  const sectionId = getSectionId(section);
  const sectionMeta = initialCategories.find((c) => c.id === sectionId);
  const typeMeta = initialCategories.find((c) => c.code === questionTypeCode);

  const sectionLabel = sectionMeta?.title || section;
  const typeLabel = typeMeta?.title || questionTypeCode;
  const description =
    typeMeta?.description ||
    `This practice test helps you improve ${sectionLabel.toLowerCase()} skills for the PTE Academic exam.`;

  return (
    <div className="mb-5">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-xs text-gray-500 gap-1">
        <Link href="/pte/academic/dashboard" className="hover:underline inline-flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          Dashboard
        </Link>
        <ChevronRight className="w-3 h-3 opacity-60" />
        <Link href="/pte/academic/practice" className="hover:underline">
          Practice
        </Link>
        <ChevronRight className="w-3 h-3 opacity-60" />
        <span>Academic</span>
        <ChevronRight className="w-3 h-3 opacity-60" />
        <span>{sectionLabel}</span>
        <ChevronRight className="w-3 h-3 opacity-60" />
        <span className="font-medium text-gray-700">{typeLabel}</span>
      </nav>

      {/* Title + Sub */}
      <div className="mt-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-semibold">
            PTE Academic {typeLabel} Practice Test
          </h1>
          {typeMeta?.scoring_type === 'ai' && (
            <Badge className="bg-yellow-500 text-yellow-900">AI</Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex items-center gap-6 text-sm">
        <button className="border-b-2 border-blue-600 text-blue-700 pb-1 font-medium">
          All Questions
        </button>
        <button className="text-gray-500 hover:text-gray-700 pb-1">Weekly Prediction</button>
        <button className="text-gray-500 hover:text-gray-700 pb-1">November Prediction</button>
      </div>

      {/* Filters row (compact) */}
      <div className="mt-3 flex items-center gap-2">
        <select className="border rounded-md px-2 py-1 text-xs">
          <option>All</option>
          <option>New</option>
          <option>Practiced</option>
        </select>
        <select className="border rounded-md px-2 py-1 text-xs">
          <option>None</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
        <select className="border rounded-md px-2 py-1 text-xs">
          <option>Default</option>
          <option>Most Practiced</option>
          <option>Recent</option>
        </select>
      </div>
    </div>
  );
}