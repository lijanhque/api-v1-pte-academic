import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writingQuestions } from '@/drizzle/schema';

export async function GET(request: NextRequest) {
  try {
    const questions = await db.select().from(writingQuestions);
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching writing questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch writing questions' },
      { status: 500 }
    );
  }
}