import Link from 'next/link';
import { BookOpen, FileCheck, History } from 'lucide-react';

export default function PracticePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">PTE Practice</h1>
        <p className="mt-2 text-muted-foreground">
          Practice questions for PTE exam by question type
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Link
          href="/pte/practice/full-tests"
          className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Full Tests</h3>
          <p className="text-sm text-muted-foreground">
            Complete PTE practice tests with all sections
          </p>
          <div className="mt-4 text-sm font-medium text-primary">5000+ Questions →</div>
        </Link>

        <Link
          href="/pte/practice/section-tests"
          className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <FileCheck className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Section Tests</h3>
          <p className="text-sm text-muted-foreground">
            Practice individual sections: Reading, Writing, Listening, Speaking
          </p>
          <div className="mt-4 text-sm font-medium text-primary">Start Practice →</div>
        </Link>

        <Link
          href="/pte/practice/history"
          className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <History className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Test History</h3>
          <p className="text-sm text-muted-foreground">
            Review your past attempts and track your progress
          </p>
          <div className="mt-4 text-sm font-medium text-primary">View History →</div>
        </Link>
      </div>
    </div>
  );
}
