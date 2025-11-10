'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { getUserProfile } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  targetScore: z.number().min(10).max(90).optional().default(65),
  examDate: z.string().optional(), // Will be converted to Date later
});

export async function updateProfile(prevState: any, formData: FormData) {
  const user = await getUserProfile();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Validate the form data
  const rawData = Object.fromEntries(formData);
  const validatedData = updateProfileSchema.safeParse({
    name: rawData.name as string,
    email: rawData.email as string,
    targetScore: Number(rawData.targetScore) || undefined,
    examDate: rawData.examDate as string || undefined,
  });
  
  if (!validatedData.success) {
    return { error: validatedData.error.errors[0].message };
  }

  const { name, email, targetScore, examDate } = validatedData.data;

  try {
    // Update user profile with target score and exam date
    await db.update(users)
      .set({ 
        name, 
        email,
        targetScore: targetScore || 65,
        examDate: examDate ? new Date(examDate) : undefined
      })
      .where(eq(users.id, user.id));

    return { 
      success: 'Profile updated successfully.',
      name,
      email,
      targetScore: targetScore || 65,
      examDate: examDate || null
    };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error: 'Failed to update profile. Please try again.' };
  }
}

// Specific function for updating just the target score
export async function updateTargetScore(targetScore: number) {
  const user = await getUserProfile();
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const result = await db
      .update(users)
      .set({ targetScore })
      .where(eq(users.id, user.id))
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error updating target score:', error);
    throw new Error('Failed to update target score');
  }
}

// Specific function for updating just the exam date
export async function updateExamDate(examDate: Date) {
  const user = await getUserProfile();
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const result = await db
      .update(users)
      .set({ examDate })
      .where(eq(users.id, user.id))
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error updating exam date:', error);
    throw new Error('Failed to update exam date');
  }
}