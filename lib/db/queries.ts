import { eq } from 'drizzle-orm';
import { db } from './drizzle';
import { users, organizations } from './schema';
import { getCurrentUser } from '@/lib/auth/server';

export async function getUserProfile() {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export const getUser = getUserProfile;

export async function getTeamForUser() {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return null;
  }

  const userWithOrg = await db
    .select({
      organization: organizations,
    })
    .from(users)
    .leftJoin(organizations, eq(users.organization_id, organizations.id))
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (userWithOrg.length === 0 || !userWithOrg[0].organization) {
    return null;
  }

  return userWithOrg[0].organization;
}

export async function getTests() {
  const tests = await db.select().from(pteTests);
  return tests;
}

export async function updateUser(userData: Partial<typeof users.$inferInsert>) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    throw new Error("Not authenticated");
  }

  const [updatedUser] = await db
    .update(users)
    .set(userData)
    .where(eq(users.id, authUser.id))
    .returning();

  return updatedUser;
}