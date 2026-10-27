import "server-only";
import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";

export type WishlistItem = {
  id: string;
  perfume_id: string;
  name: string;
  house: string | null;
  accords: string[];
};

// The signed-in user's wishlist (RLS scopes it). Deduped per request.
export const getWishlist = cache(
  async (): Promise<{ items: WishlistItem[]; error: boolean }> => {
    const { data, error } = await createServerSupabase()
      .from("wishlist_items")
      .select("id, perfume_id, name, house, accords")
      .order("created_at", { ascending: false });
    if (error) console.error("getWishlist", error);
    return { items: data ?? [], error: Boolean(error) };
  },
);
