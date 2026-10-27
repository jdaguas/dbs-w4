import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddButton } from "@/app/collection/add-button";
import { SectionHeading } from "@/components/headings";
import { PyramidView, type Tier } from "@/components/pyramid";
import { Recommendations } from "@/components/recommendations";
import { AccordTags, ScentAvatar } from "@/components/scent";
import { StatusBox } from "@/components/status-box";
import { getCollection } from "@/lib/collection";
import { getWishlist } from "@/lib/wishlist";
import { findSimilar, getPerfume, type PerfumeDetail } from "@/lib/tenml";
import { WishlistButton } from "./wishlist-button";

// 10ML ids are lowercase slugs, e.g. "armaf-club-de-nuit-untold".
const PERFUME_ID = /^[a-z0-9-]{1,200}$/;

// Any catalog perfume, reached from a recommendation or a search result.
export default async function CatalogPerfumePage({ params }: PageProps<"/perfume/[id]">) {
  await auth.protect();
  const { id } = await params;
  if (!PERFUME_ID.test(id)) notFound();

  const result = await getPerfume(id);
  if (result.status === "unavailable") {
    return (
      <Shell>
        <StatusBox tone="error">
          The perfume catalog is unavailable right now. Please try again in a minute.
        </StatusBox>
      </Shell>
    );
  }
  if (result.status === "empty") notFound();

  const perfume = result.data;
  const tryLink = perfume.links?.find((link) => link.type === "try");
  const subtitle = [perfume.family, perfume.concentration, perfume.gender, perfume.year]
    .filter(Boolean)
    .join(" · ");

  return (
    <Shell>
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <ScentAvatar accords={perfume.accords} size="lg" />
          <div>
            {perfume.house && <p className="eyebrow">{perfume.house}</p>}
            <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight">
              {perfume.name}
            </h1>
            {subtitle && <p className="mt-1 text-sm capitalize text-muted">{subtitle}</p>}
          </div>
        </div>
        <Suspense fallback={null}>
          <PerfumeActions perfumeId={perfume.id} />
        </Suspense>
      </div>

      {perfume.character && (
        <p className="mt-8 max-w-2xl font-display text-xl italic leading-relaxed text-ink-soft">
          “{perfume.character}”
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm shadow-sage/5">
          <SectionHeading title="Notes" />
          <div className="mt-5">
            <PyramidView tiers={pyramidTiers(perfume)} />
          </div>
          {perfume.accords.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Accords</p>
              <AccordTags accords={perfume.accords} />
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm shadow-sage/5">
          <SectionHeading title="How it wears" />
          <dl className="mt-5 space-y-4 text-sm">
            <Meter label="Longevity" value={perfume.longevity} low="Short" high="Very long" />
            <Meter label="Projection" value={perfume.projection} low="Skin scent" high="Fills a room" />
            <Facts label="Seasons" values={perfume.seasons} />
            <Facts label="Occasions" values={perfume.occasions} />
            <Facts label="Perfumers" values={perfume.perfumers} />
          </dl>
          {tryLink && (
            <a
              href={tryLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block text-sm font-medium text-sage underline decoration-sage/40 underline-offset-4 hover:decoration-sage"
            >
              View on 10ML
            </a>
          )}
        </section>
      </div>

      <section className="mt-12">
        <SectionHeading title="Similar perfumes">
          Keep exploring: open any of these to see its notes.
        </SectionHeading>
        <Suspense fallback={<StatusBox>Finding similar perfumes…</StatusBox>}>
          <SimilarPerfumes perfumeId={perfume.id} />
        </Suspense>
      </section>
    </Shell>
  );
}

// Owned: link to the collection copy. Otherwise: wishlist toggle and add to collection.
async function PerfumeActions({ perfumeId }: { perfumeId: string }) {
  const [collection, wishlist] = await Promise.all([getCollection(), getWishlist()]);
  const owned = collection.items.find((item) => item.perfume_id === perfumeId);
  if (owned) {
    return (
      <Link
        href={`/collection/${owned.id}`}
        className="rounded-full border border-line-strong px-4 py-2 text-sm font-medium hover:bg-sage-soft"
      >
        Open in your collection
      </Link>
    );
  }
  const wished = wishlist.items.find((item) => item.perfume_id === perfumeId);
  return (
    <div className="flex items-start gap-3">
      <WishlistButton perfumeId={perfumeId} itemId={wished?.id ?? null} />
      <AddButton perfumeId={perfumeId} inCollection={false} label="Add to collection" />
    </div>
  );
}

async function SimilarPerfumes({ perfumeId }: { perfumeId: string }) {
  const result = await findSimilar({ perfumeId });
  return <Recommendations result={result} excludeId={perfumeId} />;
}

function pyramidTiers(perfume: PerfumeDetail): Tier[] {
  const { top = [], heart = [], base = [] } = perfume.pyramid ?? {};
  const tiers = [
    { label: "Top", notes: top },
    { label: "Heart", notes: heart },
    { label: "Base", notes: base },
  ].filter((tier) => tier.notes.length > 0);
  // No pyramid in the catalog: fall back to the key notes, ungrouped.
  return tiers.length ? tiers : [{ label: "Key notes", notes: perfume.key_notes }];
}

// 1–5 rating as five dots.
function Meter({
  label,
  value,
  low,
  high,
}: {
  label: string;
  value?: number | null;
  low: string;
  high: string;
}) {
  if (!value) return null;
  const filled = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-subtle">{label}</dt>
      <dd className="mt-1.5 flex items-center gap-3">
        <span className="flex gap-1" aria-label={`${filled} out of 5`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              aria-hidden
              className={`h-2.5 w-6 rounded-full ${n <= filled ? "bg-sage" : "bg-sage-soft"}`}
            />
          ))}
        </span>
        <span className="text-xs text-muted">{filled >= 4 ? high : filled <= 2 ? low : "Moderate"}</span>
      </dd>
    </div>
  );
}

function Facts({ label, values }: { label: string; values?: string[] }) {
  if (!values?.length) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-subtle">{label}</dt>
      <dd className="mt-1 capitalize text-ink-soft">{values.join(", ")}</dd>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <Link href="/collection" className="text-sm text-muted hover:text-ink">
        ← My collection
      </Link>
      <div className="mt-6">{children}</div>
    </main>
  );
}
