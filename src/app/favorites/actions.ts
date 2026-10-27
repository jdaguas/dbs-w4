"use server";

import { auth } from "@clerk/nextjs/server";
import { refresh } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  FAVORITE_ACCORD_OPTIONS,
  FAVORITE_NOTE_OPTIONS,
  MAX_FAVORITE_ACCORDS,
} from "@/lib/taste-options";

export type ActionState = { error?: string; done?: boolean };

// Saves the signed-in user's favorite notes and accords (one row per person).
export async function saveFavorites(notes: string[], accords: string[]): Promise<ActionState> {
  const { userId } = await auth();
  if (!userId) return { error: "Please sign in first." };

  // Only keep names from the lists on the page.
  const noteOptions = new Set(FAVORITE_NOTE_OPTIONS);
  const accordOptions = new Set(FAVORITE_ACCORD_OPTIONS);
  const cleanNotes = [...new Set(notes)].filter((note) => noteOptions.has(note));
  const cleanAccords = [...new Set(accords)]
    .filter((accord) => accordOptions.has(accord))
    .slice(0, MAX_FAVORITE_ACCORDS);

  // user_id comes from the column default (the Clerk `sub`), so it's never sent from here.
  const { error } = await createServerSupabase()
    .from("taste_preferences")
    .upsert(
      {
        favorite_notes: cleanNotes,
        favorite_accords: cleanAccords,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  if (error) {
    console.error("saveFavorites", error);
    return { error: "Couldn't save your favorites. Please try again." };
  }

  refresh();
  return { done: true };
}
