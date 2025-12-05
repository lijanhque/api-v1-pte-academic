/**
 * Direct database queries to replace internal HTTP calls
 *
 * Performance improvement: Eliminates 50-100ms overhead per call by querying
 * the database directly instead of making HTTP round-trips to internal API routes.
 *
 * Usage: Replace fetchQuestionsServer() calls with getQuestionsDirectly()
 */

import { db } from "@/lib/db/drizzle";
import {
  speakingQuestions,
  readingQuestions,
  writingQuestions,
  listeningQuestions,
} from "@/lib/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

type Section = "speaking" | "reading" | "writing" | "listening";
type Difficulty = "Easy" | "Medium" | "Hard" | "All";

export interface DirectQuestionsParams {
  page?: number;
  pageSize?: number;
  difficulty?: string;
  search?: string;
  isActive?: boolean;
}

export interface DirectQuestionsResult {
  items: any[];
  page: number;
  pageSize: number;
  total: number;
}

/**
 * Convert an optional difficulty string into a Difficulty value.
 *
 * @param input - Difficulty label (case-insensitive). If omitted or not recognized, treated as unspecified.
 * @returns `"Easy"`, `"Medium"`, `"Hard"`, or `"All"`; returns `"All"` when `input` is missing or not matched.
 */
function normalizeDifficulty(input?: string): Difficulty {
  if (!input) return "All";
  const normalized =
    input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
  if (["Easy", "Medium", "Hard"].includes(normalized)) {
    return normalized as Difficulty;
  }
  return "All";
}

/**
 * Fetches paginated questions for a given section and question type directly from the database.
 *
 * Supports filtering by difficulty, free-text search (matches title or promptText), and active status.
 *
 * @param section - One of "speaking", "reading", "writing", or "listening"
 * @param questionType - Identifier for the specific question type within the section
 * @param params - Optional pagination and filter parameters:
 *   - page: Page number (defaults to 1)
 *   - pageSize: Items per page (defaults to 100)
 *   - difficulty: "Easy", "Medium", "Hard", or "All" (defaults to "All")
 *   - search: Substring to match against title or promptText (defaults to empty string)
 *   - isActive: When true, only include active questions (defaults to true)
 * @returns An object containing `page`, `pageSize`, `total` (matching item count), and `items` (the question rows)
 */
export async function getQuestionsDirectly(
  section: Section,
  questionType: string,
  params?: DirectQuestionsParams
): Promise<DirectQuestionsResult> {
  const {
    page = 1,
    pageSize = 100,
    difficulty: rawDifficulty,
    search = "",
    isActive = true,
  } = params || {};

  const difficulty = normalizeDifficulty(rawDifficulty);

  try {
    // Select the appropriate table based on section
    let table: any;
    switch (section) {
      case "speaking":
        table = speakingQuestions;
        break;
      case "reading":
        table = readingQuestions;
        break;
      case "writing":
        table = writingQuestions;
        break;
      case "listening":
        table = listeningQuestions;
        break;
      default:
        throw new Error(`Invalid section: ${section}`);
    }

    // Build where conditions
    const conditions: any[] = [eq(table.type, questionType)];

    if (typeof isActive === "boolean") {
      conditions.push(eq(table.isActive, isActive));
    }

    if (difficulty !== "All") {
      conditions.push(eq(table.difficulty, difficulty));
    }

    if (search) {
      const pattern = `%${search}%`;
      conditions.push(
        sql`(${table.title} ILIKE ${pattern} OR ${table.promptText} ILIKE ${pattern})`
      );
    }

    const whereExpr = conditions.length ? and(...conditions) : undefined;

    // Get total count
    const countRows = await (whereExpr
      ? db
          .select({ count: sql<number>`count(*)` })
          .from(table)
          .where(whereExpr)
      : db.select({ count: sql<number>`count(*)` }).from(table));

    const total = Number(countRows[0]?.count || 0);

    // Get paginated items
    const baseSelect = db.select().from(table);
    const items = await (whereExpr ? baseSelect.where(whereExpr) : baseSelect)
      .orderBy(desc(table.createdAt), desc(table.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return {
      page,
      pageSize,
      total,
      items,
    };
  } catch (error) {
    console.error(
      `[getQuestionsDirectly] Error fetching ${section}/${questionType}:`,
      error
    );
    return {
      items: [],
      page,
      pageSize,
      total: 0,
    };
  }
}

/**
 * Fetch multiple paginated question result sets in parallel for the provided requests.
 *
 * @param requests - Array of request descriptors specifying `section`, `questionType`, and optional `params`; results are returned in the same order as these requests
 * @returns An array of DirectQuestionsResult objects corresponding to each request
 */
export async function batchGetQuestions(
  requests: Array<{
    section: Section;
    questionType: string;
    params?: DirectQuestionsParams;
  }>
): Promise<DirectQuestionsResult[]> {
  const promises = requests.map((req) =>
    getQuestionsDirectly(req.section, req.questionType, req.params)
  );

  return Promise.all(promises);
}

/**
 * Selects a random set of questions for a practice session.
 *
 * Returns up to `limit` questions that match the given section and question type,
 * optionally filtered by difficulty. Difficulty input is normalized to `Easy`, `Medium`, `Hard`, or `All`.
 *
 * @param section - The section to query (`"speaking" | "reading" | "writing" | "listening"`)
 * @param questionType - The question type to filter by
 * @param limit - Maximum number of questions to return
 * @param difficulty - Optional difficulty filter (will be normalized)
 * @returns An array of question records in random order; returns an empty array if no questions are found or on error
 */
export async function getRandomQuestions(
  section: Section,
  questionType: string,
  limit: number = 10,
  difficulty?: string
): Promise<any[]> {
  const normalizedDifficulty = normalizeDifficulty(difficulty);

  try {
    let table: any;
    switch (section) {
      case "speaking":
        table = speakingQuestions;
        break;
      case "reading":
        table = readingQuestions;
        break;
      case "writing":
        table = writingQuestions;
        break;
      case "listening":
        table = listeningQuestions;
        break;
      default:
        throw new Error(`Invalid section: ${section}`);
    }

    const conditions: any[] = [
      eq(table.type, questionType),
      eq(table.isActive, true),
    ];

    if (normalizedDifficulty !== "All") {
      conditions.push(eq(table.difficulty, normalizedDifficulty));
    }

    const whereExpr = and(...conditions);

    // Use PostgreSQL random() for truly random selection
    const items = await db
      .select()
      .from(table)
      .where(whereExpr)
      .orderBy(sql`RANDOM()`)
      .limit(limit);

    return items;
  } catch (error) {
    console.error(
      `[getRandomQuestions] Error fetching ${section}/${questionType}:`,
      error
    );
    return [];
  }
}

/**
 * Retrieve counts of active questions grouped by question type for the given section.
 *
 * Only questions with isActive set to true are included in the counts.
 *
 * @param section - The section to retrieve counts for ("speaking" | "reading" | "writing" | "listening")
 * @returns A record mapping question type to its count (for example, `{ "multipleChoice": 42 }`). Returns an empty object on error.
 */
export async function getQuestionCounts(
  section: Section
): Promise<Record<string, number>> {
  try {
    let table: any;
    switch (section) {
      case "speaking":
        table = speakingQuestions;
        break;
      case "reading":
        table = readingQuestions;
        break;
      case "writing":
        table = writingQuestions;
        break;
      case "listening":
        table = listeningQuestions;
        break;
      default:
        throw new Error(`Invalid section: ${section}`);
    }

    const result = await db
      .select({
        type: table.type,
        count: sql<number>`count(*)`,
      })
      .from(table)
      .where(eq(table.isActive, true))
      .groupBy(table.type);

    return Object.fromEntries(result.map((r) => [r.type, Number(r.count)]));
  } catch (error) {
    console.error(`[getQuestionCounts] Error for ${section}:`, error);
    return {};
  }
}