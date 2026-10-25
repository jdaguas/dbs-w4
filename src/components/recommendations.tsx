import type { ApiResult, SimilarResult } from "@/lib/tenml";
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
          <li key={perfume.id} className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{perfume.name}</p>
                {perfume.house && <p className="text-sm text-stone-600">{perfume.house}</p>}
              </div>
              <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600">
                {closeness}
              </span>
            </div>
            <p className="mt-3 text-sm text-stone-700">{why}</p>
            {perfume.accords.length > 0 && (
              <p className="mt-1 text-xs text-stone-500">{perfume.accords.join(", ")}</p>
            )}
            {tryLink && (
              <a
                href={tryLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
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
