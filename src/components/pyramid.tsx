import { scentEmoji } from "@/lib/scent-emoji";

export type Tier = { label: string; notes: string[] };

// Each pyramid tier gets its own color: bright top, warm heart, deep base.
// `chip` is the note's color; `hover` is added when the chip is a button.
export const TIER_STYLES: Record<string, { label: string; dot: string; chip: string; hover: string }> = {
  Top: {
    label: "text-amber-ink",
    dot: "bg-amber",
    chip: "border-amber/40 bg-amber-soft text-amber-ink",
    hover: "hover:border-amber",
  },
  Heart: {
    label: "text-blush-ink",
    dot: "bg-blush",
    chip: "border-blush/50 bg-blush-soft text-blush-ink",
    hover: "hover:border-blush",
  },
  Base: {
    label: "text-sage-dark",
    dot: "bg-sage",
    chip: "border-sage/30 bg-sage-soft text-sage-dark",
    hover: "hover:border-sage",
  },
};

export function tierStyle(label: string) {
  return TIER_STYLES[label] ?? TIER_STYLES.Base;
}

export function TierLabel({ label }: { label: string }) {
  const style = tierStyle(label);
  return (
    <p
      className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${style.label}`}
    >
      <span aria-hidden className={`h-2 w-2 rounded-full ${style.dot}`} />
      {label}
    </p>
  );
}

// Read-only pyramid for catalog perfumes (the collection page has the editable one).
export function PyramidView({ tiers }: { tiers: Tier[] }) {
  return (
    <div className="space-y-4">
      {tiers.map((tier) => (
        <div key={tier.label}>
          <TierLabel label={tier.label} />
          <ul className="mt-2 flex flex-wrap gap-2">
            {tier.notes.map((note) => (
              <li
                key={note}
                className={`rounded-full border px-3 py-1.5 text-sm ${tierStyle(tier.label).chip}`}
              >
                {scentEmoji(note) && (
                  <span aria-hidden className="mr-1.5">
                    {scentEmoji(note)}
                  </span>
                )}
                {note}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
