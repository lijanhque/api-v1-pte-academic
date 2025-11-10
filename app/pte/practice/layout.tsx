export default function PracticeLayout({
  children,
  questions,
  viewer,
}: {
  children: React.ReactNode;
  questions: React.ReactNode;
  viewer: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full">
      <div className="w-1/3 border-r">{questions}</div>
      <div className="w-2/3">{viewer}</div>
    </div>
  );
}
