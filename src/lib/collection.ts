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

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// One item from the signed-in user's collection, or null if it isn't theirs / doesn't exist.
export async function getCollectionItem(
  id: string,
): Promise<{ item: CollectionItem | null; error: boolean }> {
  if (!UUID.test(id)) return { item: null, error: false };
  const { data, error } = await createServerSupabase()
    .from("collection_items")
    .select("id, perfume_id, name, house, notes, accords, discarded_notes")
    .eq("id", id)
    .maybeSingle();
  if (error) console.error("getCollectionItem", error);
  return { item: data, error: Boolean(error) };
}

export function keptNotes(item: CollectionItem): string[] {
  const discarded = new Set(item.discarded_notes);
  return item.notes.filter((note) => !discarded.has(note));
}
