-- Restores owner-only reads on collection_items after the deliberate break.
-- Applied by hand in the Supabase SQL Editor.
alter policy "collection_items_select_own" on public.collection_items
  using ((select auth.jwt()->>'sub') = user_id);
