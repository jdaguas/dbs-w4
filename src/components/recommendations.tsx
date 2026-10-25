import type { ApiResult, SimilarResult } from "@/lib/tenml";
import { AccordTags, ScentAvatar } from "./scent";
import { StatusBox } from "./status-box";

// Renders a /similar result, with designed empty and unavailable states.
export function Recommendations({
  result,
  excludeId,
}: {
  result: ApiResult<SimilarResult[]>;
  excludeId?: string;
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
    return (
      <StatusBox>
        No similar perfumes found for this combination. Try keeping a few more notes.
      </StatusBox>
    );
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
                  <p className="font-medium">{perfume.name}</p>
                  {perfume.house && <p className="text-sm text-muted">{perfume.house}</p>}
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-blush-soft px-2.5 py-1 text-xs font-medium text-blush-ink">
                {closeness}
              </span>
            </div>
            <p className="mt-3 text-sm text-ink-soft">{why}</p>
            <AccordTags accords={perfume.accords} />
            {tryLink && (
              <a
                href={tryLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-medium text-sage underline decoration-sage/40 underline-offset-4 hover:decoration-sage"
              >
                View on 10ML
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
