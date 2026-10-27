"use client";

import { useState, useTransition } from "react";
import { removeFromWishlist } from "./actions";

export function RemoveButton({ id }: { id: string }) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await removeFromWishlist(id);
            setError(result.error);
          })
        }
        className="text-sm text-subtle hover:text-red-700 disabled:opacity-50"
      >
        {pending ? "Removing…" : "Remove"}
      </button>
      {error && <p className="max-w-40 text-right text-xs text-red-700">{error}</p>}
    </div>
  );
}
