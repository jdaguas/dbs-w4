import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Suspense } from "react";
import { StatusBox } from "@/components/status-box";
import { getCollection } from "@/lib/collection";
import { searchPerfumes } from "@/lib/tenml";
import { removeFromCollection } from "./actions";
import { AddButton } from "./add-button";

export default async function CollectionPage({ searchParams }: PageProps<"/collection">) {
  await auth.protect();
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">My collection</h1>

      <section className="mt-8">
        <form action="/collection" className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search perfumes, e.g. Baccarat Rouge"
            aria-label="Search perfumes"
            className="flex-1 rounded-full border border-line-strong bg-surface px-5 py-3 outline-none focus:border-sage"
          />
          <button
            type="submit"
            className="rounded-full bg-sage px-6 py-3 font-medium text-white hover:bg-sage-dark"
          >
            Search
          </button>
        </form>
        {query && (
          <Suspense key={query} fallback={<StatusBox>Searching the catalog…</StatusBox>}>
            <SearchResults query={query} />
          </Suspense>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Saved perfumes</h2>
        <Suspense fallback={<StatusBox>Loading your collection…</StatusBox>}>
          <CollectionList />
        </Suspense>
      </section>
    </main>
  );
}

async function SearchResults({ query }: { query: string }) {
  const [result, collection] = await Promise.all([searchPerfumes(query), getCollection()]);

  if (result.status === "unavailable") {
    return (
      <StatusBox tone="error">
        The perfume catalog is unavailable right now. Please try again in a minute.
      </StatusBox>
    );
  }
  if (result.status === "empty") {
    return (
      <StatusBox>
        No perfumes found for “{query}”. Some brands aren&apos;t in the catalog; try another name
        or a single word.
      </StatusBox>
    );
  }

  const saved = new Set(collection.items.map((item) => item.perfume_id));
  return (
    <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface shadow-sm shadow-sage/5">
      {result.data.map((perfume) => (
        <li key={perfume.id} className="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="font-medium">{perfume.name}</p>
            <p className="text-sm text-muted">
              {[perfume.house, perfume.year].filter(Boolean).join(" · ")}
            </p>
            {perfume.accords.length > 0 && (
              <p className="mt-1 text-xs text-subtle">{perfume.accords.join(", ")}</p>
            )}
          </div>
          <AddButton perfumeId={perfume.id} inCollection={saved.has(perfume.id)} />
        </li>
      ))}
    </ul>
  );
}

async function CollectionList() {
  const { items, error } = await getCollection();

  if (error) {
    return <StatusBox tone="error">Couldn&apos;t load your collection. Please refresh.</StatusBox>;
  }
  if (items.length === 0) {
    return <StatusBox>Your collection is empty. Search above to add your first perfume.</StatusBox>;
  }

  return (
    <ul className="mt-4 grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.id} className="rounded-2xl border border-line bg-surface p-5 shadow-sm shadow-sage/5 transition-colors hover:border-sage/40">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link
                href={`/collection/${item.id}`}
                className="font-medium underline-offset-4 hover:underline"
              >
                {item.name}
              </Link>
              {item.house && <p className="text-sm text-muted">{item.house}</p>}
            </div>
            <form action={removeFromCollection}>
              <input type="hidden" name="id" value={item.id} />
              <button type="submit" className="text-sm text-subtle hover:text-red-700">
                Remove
              </button>
            </form>
          </div>
          <p className="mt-3 text-xs text-subtle">
            {item.notes.length - item.discarded_notes.length} of {item.notes.length} notes kept
          </p>
        </li>
      ))}
    </ul>
  );
}
