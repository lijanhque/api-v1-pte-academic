'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  users,
} from '@/lib/db/schema';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/db/queries';
import { auth } from './auth';
import { headers } from 'next/headers';

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address')
});

export async function updateAccount(prevState: any, formData: FormData) {
  const user = await getUserProfile();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const result = updateAccountSchema.safeParse(Object.fromEntries(formData));
  
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { name, email } = result.data;

  await db.update(users).set({ name, email }).where(eq(users.id, user.id));

  return { name, success: 'Account updated successfully.' };
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
});

export async function updatePassword(prevState: any, formData: FormData) {
  const user = await getUserProfile();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const result = updatePasswordSchema.safeParse(Object.fromEntries(formData));
  
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { currentPassword, newPassword, confirmPassword } = result.data;

  if (currentPassword === newPassword) {
    return {
      error: 'New password must be different from the current password.'
    };
  }

  if (confirmPassword !== newPassword) {
    return {
      error: 'New password and confirmation password do not match.'
    };
  }

  try {
    // Use Better Auth to update password
    await auth.api.changePassword({
      body: {
        newPassword,
        currentPassword,
      },
      headers: await headers(),
    });

    return {
      success: 'Password updated successfully.'
    };
  } catch (error) {
    return {
      error: 'Failed to update password. Please check your current password.'
    };
  }
}

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100)
});

export async function deleteAccount(prevState: any, formData: FormData) {
  const user = await getUserProfile();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const result = deleteAccountSchema.safeParse(Object.fromEntries(formData));
  
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  // Delete the user account
  await db.delete(users).where(eq(users.id, user.id));

  // Sign out using Better Auth
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect('/sign-in');
}
