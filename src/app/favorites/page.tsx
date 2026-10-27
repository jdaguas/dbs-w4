import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import { Recommendations } from "@/components/recommendations";
import { PageHeader, SectionHeading } from "@/components/headings";
import { StatusBox } from "@/components/status-box";
import { getTastePreferences, type TastePreferences } from "@/lib/taste";
import { findSimilar } from "@/lib/tenml";
import { FavoritesPicker } from "./favorites-picker";

export default async function FavoritesPage() {
  await auth.protect();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <PageHeader eyebrow="Start from scratch" title="Favorite notes">
        No collection yet? Pick the accords and notes you love and we&apos;ll find perfumes built
        around them. Your picks are saved for next time.
      </PageHeader>
      {/* Reads the signed-in user's row, so it streams in behind the boundary. */}
      <Suspense fallback={<StatusBox>Loading your favorites…</StatusBox>}>
        <Favorites />
      </Suspense>
    </main>
  );
}

async function Favorites() {
  const { prefs, error } = await getTastePreferences();

  if (error) {
    return <StatusBox tone="error">Couldn&apos;t load your favorites. Please refresh.</StatusBox>;
  }

  return (
    <>
      <section className="mt-8 rounded-2xl border border-line bg-surface p-6 shadow-sm shadow-sage/5">
        <FavoritesPicker
          initialNotes={prefs.favorite_notes}
          initialAccords={prefs.favorite_accords}
        />
      </section>

      <section className="mt-12">
        <SectionHeading title="Recommended for you" />
        <Suspense
          key={[...prefs.favorite_notes, "|", ...prefs.favorite_accords].join(",")}
          fallback={<StatusBox>Finding perfumes…</StatusBox>}
        >
          <FavoriteRecommendations prefs={prefs} />
        </Suspense>
      </section>
    </>
  );
}

async function FavoriteRecommendations({ prefs }: { prefs: TastePreferences }) {
  const notes = prefs.favorite_notes;
  const accords = prefs.favorite_accords;
  if (notes.length === 0 && accords.length === 0) {
    return <StatusBox>Pick a few accords or notes above to see recommendations.</StatusBox>;
  }

  const result = await findSimilar({ notes, accords });
  return (
    <Recommendations
      result={result}
      emptyMessage="No perfumes match this combination. Try picking fewer or different notes."
    />
  );
}
