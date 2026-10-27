# Scent Match

Build a perfume collection, choose which notes you care about, and get recommendations built from them.

**Live app:** https://dbs-w4.vercel.app. Sign up with any email; your data is private to your account.

MPCS 51238 Design, Build, Ship, Assignment 4 (full stack app with Clerk, Supabase and one external API).

## What you can do

- **Build a collection.** Search the catalog and add perfumes you own or love.
- **Tune a perfume.** Open a perfume to see its notes by tier (top / heart / base) and its accords. Click a
  note to leave it out of your recommendations. Your choices are saved per perfume.
- **Get recommendations.** Similar perfumes are matched on the notes you kept and the accords.
- **Explore any perfume.** Recommendations and search results open a catalog page with the note pyramid,
  how it wears (longevity, projection, seasons, occasions) and its own similar perfumes.
- **Keep a wishlist.** Save perfumes you want but don't own yet. Adding one to your collection takes it off
  the wishlist.
- **No collection yet?** Pick favorite notes and accords (up to 6) and get recommendations from those.

Everything you save is still there after you sign out and back in, on any device.

## Stack

| Part | Choice |
|---|---|
| App | Next.js 16 (App Router, Cache Components) + Tailwind CSS 4 |
| Sign-in | Clerk (development instance) |
| Database | Supabase Postgres, connected to Clerk with Supabase third-party auth |
| External API | [10ML Fragrance Index](https://mcp.10ml.com/openapi.json): free, no key, read-only |
| Test | Playwright with `@clerk/testing` |
| Hosting | Vercel (Hobby) |

## How it works

```
Browser ──▶ Next.js server (Vercel) ──▶ 10ML API        (perfume search, details, similar)
                 │
                 ├──▶ Clerk                             (who is signed in, session token)
                 └──▶ Supabase + RLS                    (collection, wishlist, favorites)
```

- **Who you are.** Clerk signs you in. The proxy (`src/proxy.ts`) runs `clerkMiddleware()`, and each
  private page calls `auth.protect()`, so a signed-out visitor is sent to sign in.
- **What you may see.** The server's Supabase client sends your Clerk session token with every query
  (`src/lib/supabase/server.ts`). Supabase trusts Clerk as a third-party auth provider, and every table has
  row-level security: `(select auth.jwt()->>'sub') = user_id`. The app never filters by user itself; the
  database does. Only the publishable key is used. The service-role key is never used anywhere, so RLS
  always applies.
- **Where the API is called.** On the server only (`src/lib/tenml.ts`), never from the browser. Responses
  are cached for a few minutes with `"use cache"`, failures become an "unavailable" state instead of an
  error page, and no key is involved. Every API view has designed loading, nothing found, and unavailable
  states.
- **Saving.** Server actions re-read perfume details from the API instead of trusting what the browser
  sends, and the `user_id` column defaults to the Clerk user ID, so the browser never sends it.

## Data model

Every table has a `user_id` (the Clerk user ID), RLS enabled, and select / insert / update / delete
policies for signed-in users on their own rows only. Signed-out visitors get no policies, so they read
nothing. Recommendations aren't stored; they're computed on each visit.

| Table | Holds |
|---|---|
| `collection_items` | Perfumes in your collection, with the notes you've chosen to leave out |
| `wishlist_items` | Perfumes you want but don't own yet |
| `taste_preferences` | One row per person: favorite notes and accords |

Full column definitions are in [AGENTS.md](AGENTS.md); the SQL is in [supabase/migrations](supabase/migrations).

## Running it locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` with your own keys (never commit it):

   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   ```

   In Supabase, add Clerk as a third-party auth provider (Authentication → Sign In / Providers → Clerk) and
   apply the migrations in `supabase/migrations`.

3. Start the dev server and open http://localhost:3000:

   ```bash
   npm run dev
   ```

## The end-to-end test

[`e2e/rls.spec.ts`](e2e/rls.spec.ts) signs in two users in separate browsers. Each one saves a different
perfume, and the test checks that neither can see the other's, even by opening the other's perfume URL.

To run it, create two test users in your Clerk development instance (emails with `+clerk_test`, e.g.
`alice+clerk_test@example.com`) and add them to `.env.local`:

```
E2E_USER_A_EMAIL=
E2E_USER_B_EMAIL=
```

Then:

```bash
npm run test:e2e
```

**Watching it fail first.** I broke row-level security on purpose by changing the select policy to
`using (true)` ([migration](supabase/migrations/20261026000000_break_collection_select_rls.sql)). The test
failed because user A's collection showed user B's perfume (`Expected: 0, Received: 1`). The full output is
in [docs/rls-test-failed.txt](docs/rls-test-failed.txt). Restoring the policy
([migration](supabase/migrations/20261026000100_restore_collection_select_rls.sql)) made it pass again.

## Keys and review

- Keys live only in `.env.local` and in Vercel environment variables. A deny rule in
  [`.claude/settings.json`](.claude/settings.json) stops the coding agent from reading `.env` files.
- Features were built on branches and merged through pull requests, with `/security-review` run before merging.
