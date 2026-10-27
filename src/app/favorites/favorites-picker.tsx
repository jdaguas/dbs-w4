"use client";

import { useState, useTransition } from "react";
import { scentEmoji } from "@/lib/scent-emoji";
import {
  FAVORITE_ACCORD_OPTIONS,
  FAVORITE_NOTE_OPTIONS,
  MAX_FAVORITE_ACCORDS,
} from "@/lib/taste-options";
import { saveFavorites } from "./actions";

type Picks = { notes: Set<string>; accords: Set<string> };

// Accord and note chips to pick favorites from. Each change is saved right away
// and the recommendations reload.
export function FavoritesPicker({
  initialNotes,
  initialAccords,
}: {
  initialNotes: string[];
  initialAccords: string[];
}) {
  const [picks, setPicks] = useState<Picks>(() => ({
    notes: new Set(initialNotes),
    accords: new Set(initialAccords),
  }));
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function save(next: Picks) {
    const previous = picks;
    setPicks(next);
    setError(undefined);
    startTransition(async () => {
      const result = await saveFavorites([...next.notes], [...next.accords]);
      if (result.error) {
        setPicks(previous);
        setError(result.error);
      }
    });
  }

  function toggle(kind: keyof Picks, name: string) {
    const set = new Set(picks[kind]);
    if (set.has(name)) set.delete(name);
    else set.add(name);
    save({ ...picks, [kind]: set });
  }

  const count = picks.notes.size + picks.accords.size;

  return (
    <div>
      <div className="space-y-5">
        <ChipGroup
          label={`Accords (up to ${MAX_FAVORITE_ACCORDS})`}
          options={FAVORITE_ACCORD_OPTIONS}
          picked={picks.accords}
          full={picks.accords.size >= MAX_FAVORITE_ACCORDS}
          onToggle={(name) => toggle("accords", name)}
        />
        <ChipGroup
          label="Notes"
          options={FAVORITE_NOTE_OPTIONS}
          picked={picks.notes}
          onToggle={(name) => toggle("notes", name)}
        />
      </div>

      <div className="mt-5 flex items-center gap-4 text-sm">
        <button
          type="button"
          onClick={() => save({ notes: new Set(), accords: new Set() })}
          disabled={count === 0}
          className="rounded-full border border-line-strong px-4 py-2 font-medium hover:bg-sage-soft disabled:opacity-40"
        >
          Clear all
        </button>
        <span className="text-subtle" aria-live="polite">
          {pending ? "Saving…" : error ? "" : count === 0 ? "" : "Saved"}
        </span>
        {error && <span className="text-red-700">{error}</span>}
      </div>
    </div>
  );
}

function ChipGroup({
  label,
  options,
  picked,
  full = false,
  onToggle,
}: {
  label: string;
  options: string[];
  picked: Set<string>;
  // At the limit: unpicked chips are disabled until one is removed.
  full?: boolean;
  onToggle: (name: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-subtle">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((name) => {
          const on = picked.has(name);
          return (
            <button
              key={name}
              type="button"
              onClick={() => onToggle(name)}
              aria-pressed={on}
              disabled={full && !on}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                on
                  ? "border-sage bg-sage text-white hover:bg-sage-dark"
                  : "border-line-strong bg-surface text-ink-soft hover:border-sage/50 hover:bg-sage-soft"
              }`}
            >
              {scentEmoji(name) && (
                <span aria-hidden className="mr-1.5">
                  {scentEmoji(name)}
                </span>
              )}
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
