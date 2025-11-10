import { createAuthClient } from "better-auth/react";
import { useEffect } from "react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;

// Custom hook to check if user is authenticated with React 19 compatibility
export function useAuth() {
  const { data: session, isPending, error } = useSession();

  useEffect(() => {
    // Handle session updates in React 19
    if (session) {
      // Session is available
    }
  }, [session]);

  return {
    user: session?.user,
    isAuthenticated: !!session?.user,
    isPending,
    error,
  };
}
