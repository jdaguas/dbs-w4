import { perfumeEmoji, scentEmoji } from "@/lib/scent-emoji";

// Round badge showing a perfume's overall category as an emoji.
export function ScentAvatar({ accords, size = "md" }: { accords: string[]; size?: "md" | "lg" }) {
  const box = size === "lg" ? "h-16 w-16 text-3xl" : "h-12 w-12 text-2xl";
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-sage-soft ring-1 ring-sage/10 ${box}`}
    >
      {perfumeEmoji(accords)}
    </span>
  );
}

// Accords as small tags, each with its emoji.
export function AccordTags({ accords }: { accords: string[] }) {
  if (accords.length === 0) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Accords">
      {accords.map((accord) => (
        <li
          key={accord}
          className="rounded-full bg-canvas px-2 py-0.5 text-xs text-muted ring-1 ring-line"
        >
          <span aria-hidden className="mr-1">
            {scentEmoji(accord) ?? "✨"}
          </span>
          {accord}
        </li>
      ))}
    </ul>
  );
}
