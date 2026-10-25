import "server-only";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// Supabase client for server components, route handlers and server actions.
// Sends the Clerk session token, so RLS sees the signed-in user's `sub`.
export function createServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      async accessToken() {
        return (await auth()).getToken();
      },
    },
  );
}
