import { LoadingSkeleton } from "@/components/pte/loading-skeleton";

export default function Loading() {
  return (
    <div className="p-4 md:p-6">
      <LoadingSkeleton height="400px" />
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-lg border bg-white p-4">
            <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="rounded-lg border bg-white p-4 space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded" />
            <div className="h-32 bg-gray-100 rounded" />
            <div className="h-2 w-full bg-gray-100 rounded" />
            <div className="flex gap-2">
              <div className="h-10 w-28 bg-gray-100 rounded" />
              <div className="h-10 w-32 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}