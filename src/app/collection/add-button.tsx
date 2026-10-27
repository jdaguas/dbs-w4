"use client";

import { useActionState } from "react";
import { addToCollection, type ActionState } from "./actions";

export function AddButton({
  perfumeId,
  inCollection,
  label = "Add",
}: {
  perfumeId: string;
  inCollection: boolean;
  label?: string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(addToCollection, {});

  if (inCollection || state.done) {
    return <span className="text-sm font-medium text-subtle">In your collection</span>;
  }

  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="perfumeId" value={perfumeId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage-dark disabled:opacity-50"
      >
        {pending ? "Adding…" : label}
      </button>
      {state.error && <p className="max-w-48 text-right text-xs text-red-700">{state.error}</p>}
    </form>
  );
}
