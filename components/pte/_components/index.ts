/**
 * PTE _components Barrel
 * Centralizes exports for production-grade, scalable component composition.
 *
 * Structure vision:
 * - dashboard/
 *    - onepte-dashboard.tsx
 *    - question-type-card.tsx
 *    - section-tabs.tsx
 * - practice/
 *    - shared components per-question-type
 * - ui/
 *    - local composition wrappers over shadcn primitives when needed
 *
 * Phase 1: Provide stable import surface while we migrate files.
 * We re-export existing components so callers can switch to:
 *   import { OnePTEDashboard } from "@/components/pte/_components"
 * without breaking current locations.
 */

// Temporary re-export while we migrate files into _components/dashboard
export { OnePTEDashboard } from "../onepte-dashboard";

// Shared types used across dashboard and practice modules
export type SectionKey = "speaking" | "writing" | "reading" | "listening";

// Registry keys and helpers to keep routes consistent across app
export const SECTION_ROUTE_BASE: Record<SectionKey, string> = {
  speaking: "/pte/practice/section-tests/speaking",
  writing: "/pte/practice/section-tests/writing",
  reading: "/pte/practice/section-tests/reading",
  listening: "/pte/practice/section-tests/listening",
};

/**
 * Link builder to a specific question type using stable section code
 * Example:
 *   hrefToQuestionType("speaking", "s_read_aloud")
 */
export function hrefToQuestionType(section: SectionKey, code: string) {
  return `${SECTION_ROUTE_BASE[section]}/${code}`;
}

/**
 * Color tokens aligned to OnePTE references.
 * Use these for lightweight theming in local components.
 */
export const SECTION_COLORS: Record<SectionKey, string> = {
  speaking: "#2563eb",
  writing: "#10b981",
  reading: "#f59e0b",
  listening: "#ef4444",
};