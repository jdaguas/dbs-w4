-- Perfumes in a person's collection, with their note choices.
create table public.collection_items (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default (auth.jwt()->>'sub'),
  perfume_id text not null,
  name text not null,
  house text,
  notes text[] not null,
  accords text[] not null,
  discarded_notes text[] not null default '{}',
  created_at timestamptz default now(),
  unique (user_id, perfume_id)
);

-- Favorite notes and accords, for people without a collection.
create table public.taste_preferences (
  user_id text primary key default (auth.jwt()->>'sub'),
  favorite_notes text[] not null default '{}',
  favorite_accords text[] not null default '{}',
  updated_at timestamptz default now()
);

alter table public.collection_items enable row level security;
alter table public.taste_preferences enable row level security;

-- collection_items: owner-only access for signed-in users.
create policy "collection_items_select_own" on public.collection_items
  for select to authenticated
  using ((select auth.jwt()->>'sub') = user_id);

create policy "collection_items_insert_own" on public.collection_items
  for insert to authenticated
  with check ((select auth.jwt()->>'sub') = user_id);

create policy "collection_items_update_own" on public.collection_items
  for update to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);

create policy "collection_items_delete_own" on public.collection_items
  for delete to authenticated
  using ((select auth.jwt()->>'sub') = user_id);

-- taste_preferences: owner-only access for signed-in users.
create policy "taste_preferences_select_own" on public.taste_preferences
  for select to authenticated
  using ((select auth.jwt()->>'sub') = user_id);

create policy "taste_preferences_insert_own" on public.taste_preferences
  for insert to authenticated
  with check ((select auth.jwt()->>'sub') = user_id);

create policy "taste_preferences_update_own" on public.taste_preferences
  for update to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);

create policy "taste_preferences_delete_own" on public.taste_preferences
  for delete to authenticated
  using ((select auth.jwt()->>'sub') = user_id);
