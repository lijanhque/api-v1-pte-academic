import { ReactNode } from "react";
import { AcademicContext } from "@/components/pte/academic-context";

export default function AcademicSectionTestsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AcademicContext>
      {children}
    </AcademicContext>
  );
}