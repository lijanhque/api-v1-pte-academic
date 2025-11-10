import { Clock, Star } from 'lucide-react';

const mockTests = [
  { id: 1, title: 'Mock Test 1', duration: '2 hours', questions: 19, isPremium: false },
  { id: 2, title: 'Mock Test 2', duration: '2 hours', questions: 19, isPremium: false },
  { id: 3, title: 'Mock Test 3', duration: '2 hours', questions: 19, isPremium: true },
  { id: 4, title: 'Mock Test 4', duration: '2 hours', questions: 19, isPremium: true },
];

export default function FullTestsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Full Practice Tests</h1>
        <p className="mt-2 text-muted-foreground">
          Take complete PTE practice tests with AI scoring
        </p>
      </div>

      {/* Free Mock Test Banner */}
      <div className="rounded-lg bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mb-2 text-xl font-bold">✨ Take free Mock Test with AI scoring</h2>
            <ul className="space-y-1 text-sm text-green-50">
              <li>• AI score + personalized feedback</li>
              <li>• Total 19-21 questions</li>
              <li>• Estimated time 90+ minutes</li>
            </ul>
          </div>
          <button className="rounded-md bg-white px-8 py-3 font-semibold text-green-600 hover:bg-green-50">
            Try Mini Mock Test →
          </button>
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockTests.map((test) => (
          <div
            key={test.id}
            className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-lg"
          >
            {test.isPremium && (
              <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                <Star className="h-3 w-3" />
                Premium
              </div>
            )}
            <h3 className="mb-3 text-xl font-semibold">{test.title}</h3>
            <div className="mb-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{test.duration}</span>
              </div>
              <div>Total {test.questions} questions</div>
            </div>
            <button
              className={`w-full rounded-md px-4 py-2 font-medium transition-colors ${
                test.isPremium
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {test.isPremium ? 'Unlock with Premium' : 'Start Test'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
