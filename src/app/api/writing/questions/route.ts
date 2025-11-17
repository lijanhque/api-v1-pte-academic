import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Here you would typically query your database for writing questions
    // For now, returning sample data
    const questions = [
      {
        id: 1,
        title: 'Summarize the following text about climate change...',
        difficulty: 'Medium',
        practiced: 0,
        stats: 'N/A'
      },
      {
        id: 2,
        title: 'Write a summary of the article about renewable energy...',
        difficulty: 'Hard',
        practiced: 5,
        stats: 'Average'
      }
    ];

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching writing questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch writing questions' },
      { status: 500 }
    );
  }
}