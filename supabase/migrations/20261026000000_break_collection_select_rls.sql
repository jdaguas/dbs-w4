-- DELIBERATE BREAK for the Playwright RLS test (Assignment 4, step 7).
-- Lets any signed-in user read every collection item. Reverted by the next migration.
-- Applied by hand in the Supabase SQL Editor.
alter policy "collection_items_select_own" on public.collection_items
  using (true);
