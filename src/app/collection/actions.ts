"use server";

import { auth } from "@clerk/nextjs/server";
import { refresh } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { allNotes, getPerfume } from "@/lib/tenml";

export type ActionState = { error?: string; done?: boolean };

export async function addToCollection(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { userId } = await auth();
  if (!userId) return { error: "Please sign in first." };

  const perfumeId = String(formData.get("perfumeId") ?? "");
  if (!perfumeId) return { error: "Missing perfume." };

  // Re-read the perfume on the server instead of trusting notes sent by the browser.
  const result = await getPerfume(perfumeId);
  if (result.status === "unavailable") {
    return { error: "The perfume catalog is unavailable right now. Try again in a minute." };
  }
  if (result.status === "empty") return { error: "That perfume is no longer in the catalog." };

  const perfume = result.data;
  const supabase = createServerSupabase();
  const { error } = await supabase.from("collection_items").insert({
    perfume_id: perfume.id,
    name: perfume.name,
    house: perfume.house,
    notes: allNotes(perfume),
    accords: perfume.accords,
  });

  // 23505 = unique violation: it's already in the collection, which is fine.
  if (error && error.code !== "23505") {
    console.error("addToCollection", error);
    return { error: "Couldn't save it. Please try again." };
  }

  refresh();
  return { done: true };
}

export async function removeFromCollection(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;

  const id = String(formData.get("id") ?? "");
  const supabase = createServerSupabase();
  // RLS limits this to the signed-in user's own rows.
  const { error } = await supabase.from("collection_items").delete().eq("id", id);
  if (error) console.error("removeFromCollection", error);

  refresh();
}
