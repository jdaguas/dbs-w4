"use client";

import { useState, useTransition } from "react";
import { addToWishlist, removeFromWishlist } from "@/app/wishlist/actions";

// Heart toggle for a catalog perfume. `itemId` is the wishlist row, if it's already saved.
export function WishlistButton({
  perfumeId,
  itemId,
}: {
  perfumeId: string;
  itemId: string | null;
}) {
  // Kept locally so the button flips as soon as the action returns, without waiting
  // for the page to re-render from the server.
  const [savedId, setSavedId] = useState(itemId);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const saved = savedId !== null;

  function toggle() {
    setError(undefined);
    startTransition(async () => {
      if (savedId !== null) {
        const result = await removeFromWishlist(savedId);
        if (result.error) setError(result.error);
        else setSavedId(null);
      } else {
        const result = await addToWishlist(perfumeId);
        if (result.error) setError(result.error);
        else setSavedId(result.id ?? null);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={saved}
        className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
          saved
            ? "border-blush bg-blush-soft text-blush-ink hover:border-blush-ink/40"
            : "border-line-strong bg-surface hover:border-blush hover:bg-blush-soft"
        }`}
      >
        <span aria-hidden className="mr-1.5">
          {saved ? "♥" : "♡"}
        </span>
        {pending ? "Saving…" : saved ? "On your wishlist" : "Add to wishlist"}
      </button>
      {error && <p className="max-w-48 text-right text-xs text-red-700">{error}</p>}
    </div>
  );
}
