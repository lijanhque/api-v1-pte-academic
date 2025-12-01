'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db/drizzle'
import { getUserProfile } from '@/lib/db/queries'
import { users } from '@/lib/db/schema'
import { auth } from './auth'

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
})

/**
 * Validate input and update the authenticated user's name and email in the database.
 *
 * Validates `formData` against the update schema, returns the first validation error if invalid,
 * updates the users table for the current authenticated user, and returns a success message
 * with the updated `name` on success or an `error` message on failure.
 *
 * @param formData - FormData containing `name` and `email` fields to apply to the user's account
 * @returns An object with `name` and `success` on successful update, or `{ error: string }` on failure
 */
export async function updateAccount(prevState: unknown, formData: FormData) {
  const user = await getUserProfile()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const result = updateAccountSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const { name, email } = result.data

  try {
    const updateResult = await db
      .update(users)
      .set({ name, email })
      .where(eq(users.id, user.id))
      .returning()

    if (!updateResult || updateResult.length === 0) {
      return { error: 'Failed to update account. User not found.' }
    }

    return { name, success: 'Account updated successfully.' }
  } catch (error) {
    console.error('Error updating account:', error)
    return { error: 'Failed to update account. Please try again.' }
  }
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100),
})

export async function updatePassword(prevState: unknown, formData: FormData) {
  const user = await getUserProfile()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const result = updatePasswordSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const { currentPassword, newPassword, confirmPassword } = result.data

  if (currentPassword === newPassword) {
    return {
      error: 'New password must be different from the current password.',
    }
  }

  if (confirmPassword !== newPassword) {
    return {
      error: 'New password and confirmation password do not match.',
    }
  }

  try {
    // Use Better Auth to update password
    await auth.api.changePassword({
      body: {
        newPassword,
        currentPassword,
      },
      headers: await headers(),
    })

    return {
      success: 'Password updated successfully.',
    }
  } catch (error) {
    return {
      error: 'Failed to update password. Please check your current password.',
    }
  }
}

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100),
})

/**
 * Deletes the currently authenticated user's account, signs them out, and redirects to the sign-in page.
 *
 * Validates the provided form data (expects a `password` field per the deletion schema), deletes the user record if found, signs the user out, and redirects to '/sign-in'. If validation or deletion fails, returns an object containing an `error` message.
 *
 * @param formData - FormData from the account deletion form; must include the `password` field.
 * @returns An object with an `error` property containing a user-facing message when validation or deletion fails; on successful deletion the function redirects to '/sign-in' and does not return a value.
 * @throws If there is no authenticated user.
 */
export async function deleteAccount(prevState: unknown, formData: FormData) {
  const user = await getUserProfile()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const result = deleteAccountSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  try {
    // Delete the user account
    const deleteResult = await db
      .delete(users)
      .where(eq(users.id, user.id))
      .returning()

    if (!deleteResult || deleteResult.length === 0) {
      return { error: 'Failed to delete account. User not found.' }
    }

    // Sign out using Better Auth
    await auth.api.signOut({
      headers: await headers(),
    })

    redirect('/sign-in')
  } catch (error) {
    console.error('Error deleting account:', error)
    return { error: 'Failed to delete account. Please try again.' }
  }
}