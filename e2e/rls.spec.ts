import { clerk } from "@clerk/testing/playwright";
import { expect, test, type Browser, type Page } from "@playwright/test";

// Two users each save a perfume; neither may see the other's.
// This relies on row-level security in Supabase, not on app code filtering by user.

const A_PERFUME = { query: "Baccarat Rouge 540", name: "Baccarat Rouge 540" };
const B_PERFUME = { query: "Santal 33", name: "Santal 33" };

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} in .env.local`);
  return value;
}

async function signedInPage(browser: Browser, user: "A" | "B"): Promise<Page> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/");
  // Signs in with a backend sign-in token (needs CLERK_SECRET_KEY). Password sign-in from a
  // fresh browser hits Clerk's Client Trust check and stops at an emailed code.
  await clerk.signIn({ page, emailAddress: env(`E2E_USER_${user}_EMAIL`) });
  return page;
}

// Search for a perfume and add it (no-op if it's already saved from an earlier run).
async function addPerfume(page: Page, perfume: { query: string; name: string }) {
  await page.goto(`/collection?q=${encodeURIComponent(perfume.query)}`);
  const row = page
    .getByRole("listitem")
    .filter({ has: page.getByText(perfume.name, { exact: true }) })
    .first();
  const add = row.getByRole("button", { name: "Add" });
  await expect(add.or(row.getByText("In your collection"))).toBeVisible();
  if (await add.isVisible()) await add.click();
  await expect(page.getByRole("link", { name: perfume.name, exact: true })).toBeVisible();
}

test("two users can't see each other's collection", async ({ browser }) => {
  const alice = await signedInPage(browser, "A");
  const bob = await signedInPage(browser, "B");

  await addPerfume(alice, A_PERFUME);
  await addPerfume(bob, B_PERFUME);

  // Each sees their own perfume and not the other's.
  await alice.goto("/collection");
  await expect(alice.getByRole("link", { name: A_PERFUME.name, exact: true })).toBeVisible();
  await expect(alice.getByRole("link", { name: B_PERFUME.name, exact: true })).toHaveCount(0);

  await bob.goto("/collection");
  await expect(bob.getByRole("link", { name: B_PERFUME.name, exact: true })).toBeVisible();
  await expect(bob.getByRole("link", { name: A_PERFUME.name, exact: true })).toHaveCount(0);

  // Bob can't open Alice's perfume by its URL either.
  await alice.goto("/collection");
  const aliceItemUrl = await alice
    .getByRole("link", { name: A_PERFUME.name, exact: true })
    .getAttribute("href");
  await bob.goto(aliceItemUrl!);
  await expect(bob.getByText(/could not be found/i)).toBeVisible();
});
