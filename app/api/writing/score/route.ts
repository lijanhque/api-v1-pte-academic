import { NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function POST(request: Request) {
  const { question, answer } = await request.json();

  // TODO: Add user authentication check

  try {
    const { object: analysis } = await generateObject({
      model: openai('gpt-4-turbo'), // Or your preferred model
      schema: z.object({
        overallScore: z.number().min(0).max(90).describe("Overall score out of 90, considering all factors."),
        grammar: z.object({
          score: z.number().min(0).max(90),
          feedback: z.string(),
          corrections: z.array(z.object({
            original: z.string(),
            corrected: z.string(),
            explanation: z.string(),
          })),
        }),
        vocabulary: z.object({
          score: z.number().min(0).max(90),
          feedback: z.string(),
          suggestions: z.array(z.object({
            original: z.string(),
            suggested: z.string(),
            reason: z.string(),
          })),
        }),
        coherence: z.object({
          score: z.number().min(0).max(90),
          feedback: z.string(),
        }),
        modelAnswer: z.string().describe("An ideal, high-scoring model answer for the given question."),
      }),
      prompt: `As a PTE Academic examiner, analyze the user's response to the 'Summarize Written Text' question.
      
      Question (Source Text): "${question}"
      
      User's Answer: "${answer}"
      
      Evaluate the user's answer based on the following criteria:
      1.  **Content:** Does the summary accurately capture the main idea and key supporting points of the source text?
      2.  **Form:** Is the answer a single, grammatically correct sentence? Is it between 5 and 75 words?
      3.  **Grammar:** Assess the grammatical accuracy. Identify errors and suggest corrections.
      4.  **Vocabulary:** Evaluate the use of academic vocabulary. Suggest more precise or appropriate words.
      5.  **Coherence:** Is the summary logical and easy to understand?

      Provide a detailed analysis and an overall score out of 90. Also, provide a perfect model answer.`,
    });

    return NextResponse.json(analysis);

  } catch (error) {
    console.error('AI scoring error:', error);
    return NextResponse.json({ error: 'Failed to get AI score.' }, { status: 500 });
  }
}
