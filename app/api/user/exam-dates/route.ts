import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { userScheduledExamDates } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/server";

/**
 * Retrieve scheduled exam dates for the authenticated user.
 *
 * @returns A JSON response containing `examDates` (an array of the user's scheduled exam date records, ordered by `examDate`) on success, or an error object with an appropriate HTTP status (`401` when unauthenticated, `500` on server error).
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const examDates = await db
      .select()
      .from(userScheduledExamDates)
      .where(eq(userScheduledExamDates.userId, user.id))
      .orderBy(userScheduledExamDates.examDate);

    return NextResponse.json({ examDates });
  } catch (error) {
    console.error("Error fetching exam dates:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam dates" },
      { status: 500 }
    );
  }
}

/**
 * Create a new scheduled exam date for the authenticated user.
 *
 * Validates the request body and stores a new record for the current user. If `isPrimary` is true,
 * any existing primary flag for that user is cleared before inserting the new date. Default values:
 * `examName` → `"PTE Academic"`, `isPrimary` → `true`.
 *
 * Expected request body fields:
 * - `examDate` (required): ISO date string for the scheduled exam; must be a future date.
 * - `examName` (optional): Display name for the exam.
 * - `isPrimary` (optional): Whether this date is the user's primary exam date.
 *
 * @returns On success, a JSON object `{ success: true, examDate: <createdRecord> }`.
 * On error, a JSON error object and corresponding HTTP status:
 * - `401` when the user is not authenticated.
 * - `400` when `examDate` is missing or is in the past.
 * - `500` when creation or an internal operation fails.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { examDate, examName, isPrimary } = await request.json();

    if (!examDate) {
      return NextResponse.json(
        { error: "Exam date is required" },
        { status: 400 }
      );
    }

    const date = new Date(examDate);
    if (date < new Date()) {
      return NextResponse.json(
        { error: "Exam date cannot be in the past" },
        { status: 400 }
      );
    }

    // If marking as primary, unset other primaries
    if (isPrimary) {
      await db
        .update(userScheduledExamDates)
        .set({ isPrimary: false })
        .where(eq(userScheduledExamDates.userId, user.id))
        .returning();
    }

    const newExamDate = await db
      .insert(userScheduledExamDates)
      .values({
        userId: user.id,
        examDate: date,
        examName: examName || "PTE Academic",
        isPrimary: isPrimary ?? true,
      })
      .returning();

    if (!newExamDate || newExamDate.length === 0) {
      return NextResponse.json(
        { error: "Failed to create exam date" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, examDate: newExamDate[0] });
  } catch (error) {
    console.error("Error creating exam date:", error);
    return NextResponse.json(
      { error: "Failed to create exam date" },
      { status: 500 }
    );
  }
}