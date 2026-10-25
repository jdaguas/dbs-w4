"use client";

import { useState, useTransition } from "react";
import { saveDiscardedNotes } from "../actions";

type Tier = { label: string; notes: string[] };

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
        {tiers.map((tier) => (
          <div key={tier.label}>
            <p className="text-xs font-medium uppercase tracking-wide text-subtle">
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
                        ? "border-sage/30 bg-sage-soft text-sage-dark hover:border-sage"
                        : "border-dashed border-line-strong bg-surface text-subtle line-through hover:border-sage/50"
                    }`}
                  >
                    {note}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
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
