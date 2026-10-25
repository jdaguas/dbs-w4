# Fragrance Recommendations App

Build a perfume collection, choose which notes you care about, and get recommendations built from them.
MPCS 51238 Assignment 4: full stack app with Clerk, Supabase and one external API.

## Stack

- Next.js (App Router) + Tailwind CSS
- Clerk for sign-in (development keys only)
- Supabase (Postgres) for saved data, connected to Clerk through Supabase third-party auth
- 10ML Fragrance Index API for perfume data
- Playwright for the end-to-end test
- Deployed on Vercel (Hobby plan)

## User flows

1. **Build a collection.** Search for a perfume and add it to your collection.
2. **Tune a perfume.** Click a perfume in your collection to see its notes (top / heart / base) and accords.
   Toggle each note to keep or discard, or keep all (the default). Your choices are saved per perfume.
3. **Get recommendations from a perfume.** Similar perfumes are found from the kept notes and accords only.
   Discarded notes are just left out of the matching; results that happen to contain them are still shown.
4. **No collection yet?** Pick favorite notes and accords from a list to get recommendations.
   These favorites are saved too, so they're there next time.

## External API: 10ML Fragrance Index

Base URL: `https://mcp.10ml.com/api/v1`. Free, no key, read-only. Spec: `https://mcp.10ml.com/openapi.json`.

| Endpoint | Use in the app |
|---|---|
| `GET /perfumes?q=...&limit=...` | Search box (to add to the collection) |
| `GET /perfumes/{id}?format=detailed` | Perfume detail: `pyramid.top/heart/base`, `accords` |
| `GET /similar?notes=a,b&accords=x,y` | Recommendations from kept notes / favorite notes and accords |
| `GET /similar?perfume={id}` | Recommendations when all notes are kept |

Known behavior (checked against the live API):
- `/similar` takes `notes` and `accords` without a `perfume`, which is how "kept notes" and "favorites" work.
  Results come ranked with `closeness` and a `why` string.
- `/similar` has no exclude filter (`notes_exclude` is silently ignored). We don't need one: discarded notes
  are simply not sent in `notes`.
- Not found on `/similar?perfume=`: HTTP 200, `target.in_index: false`, `results: []`, plus `message`.
- Some searches (e.g. "Chanel", any `house=Chanel`) return `{"error": {"code": "invalid_request", ...}}` with `total: 0`.
  Treat as "not in catalog", not as an outage.
- Fair-use rate limiting may apply; responses are cacheable (`max-age=300`).

Decision: call the API **from the Next.js server** (route handlers / server components), not the browser,
so responses can be cached and failures turned into a clean "unavailable" state.
No key is involved.

Every API view needs three designed states: **loading**, **nothing found**, **API unavailable**.

## Data model

Every table holding a person's data has a `user_id` column holding the Clerk user ID
(the `sub` claim of the Clerk session token). It defaults to `auth.jwt()->>'sub'`, so the client never sends it.
Recommendations are not stored; they're computed from these tables on each visit.

### `collection_items`: perfumes in a person's collection, with their note choices

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | `default gen_random_uuid()` |
| `user_id` | `text` not null | `default auth.jwt()->>'sub'` |
| `perfume_id` | `text` not null | 10ML id, e.g. `maison-francis-kurkdjian-baccarat-rouge-540-edp` |
| `name` | `text` not null | Copied from the API so the collection renders without an API call |
| `house` | `text` | |
| `notes` | `text[]` not null | All notes of the perfume, copied from the pyramid |
| `accords` | `text[]` not null | Copied from the API |
| `discarded_notes` | `text[]` not null | `default '{}'`; empty = keep all |
| `created_at` | `timestamptz` | `default now()` |

Unique on `(user_id, perfume_id)`. Kept notes = `notes` minus `discarded_notes`.

### `taste_preferences`: favorite notes and accords, for people without a collection

| Column | Type | Notes |
|---|---|---|
| `user_id` | `text` PK | `default auth.jwt()->>'sub'`; one row per person |
| `favorite_notes` | `text[]` not null | `default '{}'` |
| `favorite_accords` | `text[]` not null | `default '{}'` |
| `updated_at` | `timestamptz` | `default now()` |

### Row-level security

RLS is enabled on every table. Each table gets select / insert / update / delete policies for the
`authenticated` role using `(select auth.jwt()->>'sub') = user_id`. No policies for `anon`, so a
signed-out visitor reads nothing. Tables are created only through migrations.

## Rules for the agent

- Read this file before building anything; update the data model here before changing the schema.
- Never read, write or print `.env` / `.env.*` files. Keys live in `.env.local` (created by the user) and in Vercel env vars.
- The Supabase secret / service-role key is never used in browser code. Prefer the publishable key + Clerk token so RLS applies.
- Work on a branch; run `/security-review` before merging.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
