-- Perfumes a person wants but doesn't own yet.
create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default (auth.jwt()->>'sub'),
  perfume_id text not null,
  name text not null,
  house text,
  accords text[] not null,
  created_at timestamptz default now(),
  unique (user_id, perfume_id)
);

alter table public.wishlist_items enable row level security;

-- wishlist_items: owner-only access for signed-in users.
create policy "wishlist_items_select_own" on public.wishlist_items
  for select to authenticated
  using ((select auth.jwt()->>'sub') = user_id);

create policy "wishlist_items_insert_own" on public.wishlist_items
  for insert to authenticated
  with check ((select auth.jwt()->>'sub') = user_id);

create policy "wishlist_items_update_own" on public.wishlist_items
  for update to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);

create policy "wishlist_items_delete_own" on public.wishlist_items
  for delete to authenticated
  using ((select auth.jwt()->>'sub') = user_id);
