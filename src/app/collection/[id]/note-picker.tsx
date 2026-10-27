"use client";

import { useState, useTransition } from "react";
import { scentEmoji } from "@/lib/scent-emoji";
import { saveDiscardedNotes } from "../actions";

type Tier = { label: string; notes: string[] };

// Each pyramid tier gets its own color: bright top, warm heart, deep base.
const TIER_STYLES: Record<string, { label: string; dot: string; kept: string }> = {
  Top: {
    label: "text-amber-ink",
    dot: "bg-amber",
    kept: "border-amber/40 bg-amber-soft text-amber-ink hover:border-amber",
  },
  Heart: {
    label: "text-blush-ink",
    dot: "bg-blush",
    kept: "border-blush/50 bg-blush-soft text-blush-ink hover:border-blush",
  },
  Base: {
    label: "text-sage-dark",
    dot: "bg-sage",
    kept: "border-sage/30 bg-sage-soft text-sage-dark hover:border-sage",
  },
};
const DEFAULT_TIER_STYLE = TIER_STYLES.Base;

// Note chips grouped by pyramid tier. Clicking a chip keeps or discards it;
// each change is saved right away and the recommendations reload.
export function NotePicker({
  itemId,
  tiers,
  initialDiscarded,
}: {
  itemId: string;
  tiers: Tier[];
  initialDiscarded: string[];
}) {
  const [discarded, setDiscarded] = useState(() => new Set(initialDiscarded));
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function save(next: Set<string>) {
    const previous = discarded;
    setDiscarded(next);
    setError(undefined);
    startTransition(async () => {
      const result = await saveDiscardedNotes(itemId, [...next]);
      if (result.error) {
        setDiscarded(previous);
        setError(result.error);
      }
    });
  }

  function toggle(note: string) {
    const next = new Set(discarded);
    if (next.has(note)) next.delete(note);
    else next.add(note);
    save(next);
  }

  return (
    <div>
      <div className="space-y-4">
        {tiers.map((tier) => {
          const style = TIER_STYLES[tier.label] ?? DEFAULT_TIER_STYLE;
          return (
            <div key={tier.label}>
              <p
                className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${style.label}`}
              >
                <span aria-hidden className={`h-2 w-2 rounded-full ${style.dot}`} />
                {tier.label}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {tier.notes.map((note) => {
                  const kept = !discarded.has(note);
                  return (
                    <button
                      key={note}
                      type="button"
                      onClick={() => toggle(note)}
                      aria-pressed={kept}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        kept
                          ? style.kept
                          : "border-dashed border-line-strong bg-surface text-subtle line-through hover:border-sage/50"
                      }`}
                    >
                      {scentEmoji(note) && (
                        <span aria-hidden className={`mr-1.5 ${kept ? "" : "opacity-40 grayscale"}`}>
                          {scentEmoji(note)}
                        </span>
                      )}
                      {note}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-4 text-sm">
        <button
          type="button"
          onClick={() => save(new Set())}
          disabled={discarded.size === 0}
          className="rounded-full border border-line-strong px-4 py-2 font-medium hover:bg-sage-soft disabled:opacity-40"
        >
          Keep all
        </button>
        <span className="text-subtle" aria-live="polite">
          {pending ? "Saving…" : error ? "" : "Saved"}
        </span>
        {error && <span className="text-red-700">{error}</span>}
      </div>
    </div>
  );
}
