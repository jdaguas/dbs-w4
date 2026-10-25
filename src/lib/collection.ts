import "server-only";
import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";

export type CollectionItem = {
  id: string;
  perfume_id: string;
  name: string;
  house: string | null;
  notes: string[];
  accords: string[];
  discarded_notes: string[];
};

// The signed-in user's collection (RLS scopes it). Deduped per request.
export const getCollection = cache(
  async (): Promise<{ items: CollectionItem[]; error: boolean }> => {
    const { data, error } = await createServerSupabase()
      .from("collection_items")
      .select("id, perfume_id, name, house, notes, accords, discarded_notes")
      .order("created_at", { ascending: false });
    if (error) console.error("getCollection", error);
    return { items: data ?? [], error: Boolean(error) };
  },
);
