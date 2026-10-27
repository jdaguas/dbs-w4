import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";

export type TastePreferences = {
  favorite_notes: string[];
  favorite_accords: string[];
};

// The signed-in user's favorites (RLS scopes it). No row yet = nothing picked.
export async function getTastePreferences(): Promise<{
  prefs: TastePreferences;
  error: boolean;
}> {
  const { data, error } = await createServerSupabase()
    .from("taste_preferences")
    .select("favorite_notes, favorite_accords")
    .maybeSingle();
  if (error) console.error("getTastePreferences", error);
  return {
    prefs: data ?? { favorite_notes: [], favorite_accords: [] },
    error: Boolean(error),
  };
}
