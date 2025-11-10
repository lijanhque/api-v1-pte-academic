import { initialCategories } from "@/lib/pte/data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function Page() {
  const parentCategories = initialCategories.filter((c) => c.parent === null);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Start Your PTE Academic Practice Test Online
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Prepare with targeted online PTE practice tests across all sections.
        </p>
      </div>

      {parentCategories.map((parent) => {
        const childCategories = initialCategories.filter(
          (c) => c.parent === parent.id
        );
        return (
          <section key={parent.id} className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Image
                src={parent.icon}
                alt={parent.title}
                width={40}
                height={40}
              />
              <h2 className="text-xl font-semibold">{parent.title}</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {childCategories.map((child) => (
                <Card key={child.id}>
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <Image
                        src={child.icon}
                        alt={child.title}
                        width={32}
                        height={32}
                      />
                      <div>
                        <p className="font-medium">{child.title}</p>
                        <p className="text-xs text-gray-500">
                          {child.question_count} questions available
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 flex-grow">
                      {child.description}
                    </p>
                    <div className="mt-4 flex justify-end">
                      <Button asChild variant="outline">
                        <Link
                          href={`/pte/practice/section-tests/${parent.code}/${child.code}`}
                        >
                          Practice
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}