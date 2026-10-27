import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/headings";
import { AccordTags, ScentAvatar } from "@/components/scent";
import { StatusBox } from "@/components/status-box";
import { getWishlist } from "@/lib/wishlist";
import { RemoveButton } from "./remove-button";

export default async function WishlistPage() {
  await auth.protect();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <PageHeader eyebrow="Want to try" title="Wishlist">
        Perfumes you&apos;d like but don&apos;t own yet. Add one to your collection from its page
        and it moves off this list.
      </PageHeader>
      {/* Reads the signed-in user's rows, so it streams in behind the boundary. */}
      <Suspense fallback={<StatusBox>Loading your wishlist…</StatusBox>}>
        <WishlistList />
      </Suspense>
    </main>
  );
}

async function WishlistList() {
  const { items, error } = await getWishlist();

  if (error) {
    return <StatusBox tone="error">Couldn&apos;t load your wishlist. Please refresh.</StatusBox>;
  }
  if (items.length === 0) {
    return (
      <StatusBox>
        Your wishlist is empty. Open any recommended perfume and tap{" "}
        <span className="font-medium text-blush-ink">♡ Add to wishlist</span>.
      </StatusBox>
    );
  }

  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-2xl border border-line bg-surface p-5 shadow-sm shadow-sage/5 transition-colors hover:border-blush"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <ScentAvatar accords={item.accords} />
              <div>
                <Link
                  href={`/perfume/${item.perfume_id}`}
                  className="font-display text-lg font-semibold leading-snug underline-offset-4 hover:text-sage hover:underline"
                >
                  {item.name}
                </Link>
                {item.house && <p className="text-sm text-muted">{item.house}</p>}
                <AccordTags accords={item.accords} />
              </div>
            </div>
            <RemoveButton id={item.id} />
          </div>
        </li>
      ))}
    </ul>
  );
}
