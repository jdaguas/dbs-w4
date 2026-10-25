import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Recommendations } from "@/components/recommendations";
import { StatusBox } from "@/components/status-box";
import { type CollectionItem, getCollectionItem, keptNotes } from "@/lib/collection";
import { findSimilar, getPerfume } from "@/lib/tenml";
import { NotePicker } from "./note-picker";

export default async function PerfumePage({ params }: PageProps<"/collection/[id]">) {
  await auth.protect();
  const { id } = await params;
  const { item, error } = await getCollectionItem(id);

  if (error) {
    return (
      <Shell>
        <StatusBox tone="error">Couldn&apos;t load this perfume. Please refresh.</StatusBox>
      </Shell>
    );
  }
  if (!item) notFound();

  const kept = keptNotes(item);

  return (
    <Shell>
      <h1 className="text-2xl font-semibold tracking-tight">{item.name}</h1>
      {item.house && <p className="mt-1 text-stone-600">{item.house}</p>}

      <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Notes</h2>
        <p className="mt-1 text-sm text-stone-600">
          Click a note to leave it out of your recommendations. Everything is kept by default.
        </p>
        <div className="mt-5">
          <Suspense fallback={<p className="text-sm text-stone-500">Loading notes…</p>}>
            <Notes item={item} />
          </Suspense>
        </div>
        {item.accords.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Accords</p>
            <p className="mt-2 text-sm text-stone-700">{item.accords.join(", ")}</p>
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Similar perfumes</h2>
        <p className="mt-1 text-sm text-stone-600">
          {item.discarded_notes.length === 0
            ? "Based on all of this perfume's notes and accords."
            : `Based on ${kept.length} kept ${kept.length === 1 ? "note" : "notes"} and the accords.`}
        </p>
        <Suspense
          key={item.discarded_notes.join("|")}
          fallback={<StatusBox>Finding similar perfumes…</StatusBox>}
        >
          <SimilarPerfumes item={item} kept={kept} />
        </Suspense>
      </section>
    </Shell>
  );
}

// Groups the saved notes by pyramid tier, using the catalog for the grouping.
async function Notes({ item }: { item: CollectionItem }) {
  const result = await getPerfume(item.perfume_id);
  const saved = new Set(item.notes);
  const pyramid = result.status === "ok" ? result.data.pyramid : null;

  let tiers = [
    { label: "Top", notes: pyramid?.top ?? [] },
    { label: "Heart", notes: pyramid?.heart ?? [] },
    { label: "Base", notes: pyramid?.base ?? [] },
  ].map((tier) => ({ ...tier, notes: tier.notes.filter((note) => saved.has(note)) }));

  // No pyramid from the catalog (or it's down): show the saved notes ungrouped.
  if (tiers.every((tier) => tier.notes.length === 0)) {
    tiers = [{ label: "All notes", notes: item.notes }];
  } else {
    const placed = new Set(tiers.flatMap((tier) => tier.notes));
    const rest = item.notes.filter((note) => !placed.has(note));
    if (rest.length) tiers.push({ label: "Other", notes: rest });
  }

  return (
    <NotePicker
      itemId={item.id}
      tiers={tiers.filter((tier) => tier.notes.length > 0)}
      initialDiscarded={item.discarded_notes}
    />
  );
}

async function SimilarPerfumes({ item, kept }: { item: CollectionItem; kept: string[] }) {
  if (kept.length === 0 && item.accords.length === 0) {
    return <StatusBox>Keep at least one note to get recommendations.</StatusBox>;
  }

  // All notes kept: let the catalog match on the whole perfume.
  const result =
    item.discarded_notes.length === 0
      ? await findSimilar({ perfumeId: item.perfume_id })
      : await findSimilar({ notes: kept, accords: item.accords });

  return <Recommendations result={result} excludeId={item.perfume_id} />;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <Link href="/collection" className="text-sm text-stone-600 hover:text-stone-900">
        ← My collection
      </Link>
      <div className="mt-6">{children}</div>
    </main>
  );
}
