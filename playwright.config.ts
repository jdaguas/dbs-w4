import { defineConfig, devices } from "@playwright/test";

// Load keys and test-user credentials from .env.local (never committed).
try {
  process.loadEnvFile(".env.local");
} catch {
  // Already in the environment (e.g. CI).
}

export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    // Clerk testing token; must be a setup project, not globalSetup, so workers get the env vars.
    { name: "setup", testMatch: /global\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
