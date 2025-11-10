import { auth } from "@/lib/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);

// Add error handling
export const runtime = "nodejs";
export const dynamic = "force-dynamic";