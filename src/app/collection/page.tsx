import { auth } from "@clerk/nextjs/server";

export default async function CollectionPage() {
  await auth.protect();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">My collection</h1>
      <p className="mt-2 text-stone-600">
        Your saved perfumes will show up here.
      </p>
    </main>
  );
}
