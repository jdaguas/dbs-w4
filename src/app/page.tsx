import { Show, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="relative isolate mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-10 -z-10 h-80 w-80 rounded-full bg-blush-soft blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 bottom-0 -z-10 h-72 w-72 rounded-full bg-sage-soft blur-3xl"
      />
      <p className="mb-4 inline-flex w-fit rounded-full bg-sage-soft px-3 py-1 text-sm font-medium text-sage-dark">
        Notes-first perfume recommendations
      </p>
      <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
        Find perfumes that smell like the <span className="text-sage">ones you love</span>.
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
        Add perfumes to your collection, choose which notes matter to you, and
        get recommendations built from them. No collection yet? Start from your
        favorite notes.
      </p>
      <div className="mt-10">
        <Suspense>
          <Show when="signed-out">
            <SignUpButton>
              <button className="rounded-full bg-sage px-6 py-3 font-medium text-white hover:bg-sage-dark">
                Create a free account
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link
              href="/collection"
              className="inline-block rounded-full bg-sage px-6 py-3 font-medium text-white hover:bg-sage-dark"
            >
              Go to my collection
            </Link>
            <Link
              href="/favorites"
              className="ml-3 inline-block rounded-full border border-line-strong px-6 py-3 font-medium hover:bg-sage-soft"
            >
              Start from favorite notes
            </Link>
          </Show>
        </Suspense>
      </div>
    </main>
  );
}
