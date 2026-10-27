"use server";

import { auth } from "@clerk/nextjs/server";
import { refresh } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { getPerfume } from "@/lib/tenml";

export type ActionState = { error?: string; done?: boolean };
export type AddState = ActionState & { id?: string };

export async function addToWishlist(perfumeId: string): Promise<AddState> {
  const { userId } = await auth();
  if (!userId) return { error: "Please sign in first." };
  if (!perfumeId) return { error: "Missing perfume." };

  // Re-read the perfume on the server instead of trusting details sent by the browser.
  const result = await getPerfume(perfumeId);
  if (result.status === "unavailable") {
    return { error: "The perfume catalog is unavailable right now. Try again in a minute." };
  }
  if (result.status === "empty") return { error: "That perfume is no longer in the catalog." };

  const perfume = result.data;
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("wishlist_items")
    .insert({
      perfume_id: perfume.id,
      name: perfume.name,
      house: perfume.house,
      accords: perfume.accords,
    })
    .select("id")
    .single();

  // 23505 = unique violation: it's already on the wishlist, so return the existing row.
  let id = data?.id as string | undefined;
  if (error?.code === "23505") {
    const existing = await supabase
      .from("wishlist_items")
      .select("id")
      .eq("perfume_id", perfume.id)
      .maybeSingle();
    id = existing.data?.id;
  } else if (error) {
    console.error("addToWishlist", error);
    return { error: "Couldn't save it. Please try again." };
  }

  refresh();
  return { done: true, id };
}

export async function removeFromWishlist(id: string): Promise<ActionState> {
  const { userId } = await auth();
  if (!userId) return { error: "Please sign in first." };

  // RLS limits this to the signed-in user's own rows.
  const { error } = await createServerSupabase().from("wishlist_items").delete().eq("id", id);
  if (error) {
    console.error("removeFromWishlist", error);
    return { error: "Couldn't remove it. Please try again." };
  }

  refresh();
  return { done: true };
}
