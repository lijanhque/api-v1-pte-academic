"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  fetchOptions: {
    headers: {
      "Content-Type": "application/json",
    },
  },
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;

// Custom hook to check if user is authenticated
export function useAuth() {
  const { data: session, isPending } = useSession();
  
  return {
    user: session?.user,
    isAuthenticated: !!session?.user,
    isPending,
  };
}
