import Link from "next/link";
import type { ApiResult, SimilarResult } from "@/lib/tenml";
import { AccordTags, ScentAvatar } from "./scent";
import { StatusBox } from "./status-box";

// Renders a /similar result, with designed empty and unavailable states.
export function Recommendations({
  result,
  excludeId,
  emptyMessage = "No similar perfumes found for this combination. Try keeping a few more notes.",
}: {
  result: ApiResult<SimilarResult[]>;
  excludeId?: string;
  emptyMessage?: string;
}) {
  if (result.status === "unavailable") {
    return (
      <StatusBox tone="error">
        Recommendations are unavailable right now because the perfume catalog isn&apos;t
        responding. Please try again in a minute.
      </StatusBox>
    );
  }

  const results =
    result.status === "ok" ? result.data.filter((r) => r.perfume.id !== excludeId) : [];
  if (results.length === 0) {
    return <StatusBox>{emptyMessage}</StatusBox>;
  }

  return (
    <ul className="mt-4 grid gap-4 sm:grid-cols-2">
      {results.map(({ perfume, closeness, why }) => {
        const tryLink = perfume.links?.find((link) => link.type === "try");
        return (
          <li key={perfume.id} className="rounded-2xl border border-line bg-surface p-5 shadow-sm shadow-sage/5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <ScentAvatar accords={perfume.accords} />
                <div>
                  <Link
                    href={`/perfume/${perfume.id}`}
                    className="font-display text-lg font-semibold leading-snug underline-offset-4 hover:text-sage hover:underline"
                  >
                    {perfume.name}
                  </Link>
                  {perfume.house && <p className="text-sm text-muted">{perfume.house}</p>}
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-blush-soft px-2.5 py-1 text-xs font-medium text-blush-ink">
                {closeness}
              </span>
            </div>
            <p className="mt-3 text-sm text-ink-soft">{why}</p>
            <AccordTags accords={perfume.accords} />
            <div className="mt-3 flex items-center gap-5 text-sm font-medium">
              <Link
                href={`/perfume/${perfume.id}`}
                className="text-sage-dark hover:text-sage"
              >
                Explore notes →
              </Link>
              {tryLink && (
                <a
                  href={tryLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sage underline decoration-sage/40 underline-offset-4 hover:decoration-sage"
                >
                  View on 10ML
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
