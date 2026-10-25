import { Show, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-24">
      <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
        Find perfumes that smell like the ones you love.
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-stone-600">
        Add perfumes to your collection, choose which notes matter to you, and
        get recommendations built from them. No collection yet? Start from your
        favorite notes.
      </p>
      <div className="mt-10">
        <Suspense>
          <Show when="signed-out">
            <SignUpButton>
              <button className="rounded-full bg-stone-900 px-6 py-3 font-medium text-white hover:bg-stone-700">
                Create a free account
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link
              href="/collection"
              className="inline-block rounded-full bg-stone-900 px-6 py-3 font-medium text-white hover:bg-stone-700"
            >
              Go to my collection
            </Link>
          </Show>
        </Suspense>
      </div>
    </main>
  );
}
