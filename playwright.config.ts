import { defineConfig, devices } from "@playwright/test";
import { existsSync, readdirSync } from "node:fs";

/**
 * Reuse browsers that are already present in the environment when the bundled
 * revision hasn't been downloaded (CI sandboxes, offline machines).
 */
function localBrowser(prefix: string, ...relative: string[]) {
  const root = "/opt/ms-playwright";
  if (!existsSync(root)) return undefined;
  const dirs = readdirSync(root).filter((d) => d.startsWith(`${prefix}-`));
  for (const d of dirs) {
    for (const rel of relative) {
      const p = `${root}/${d}/${rel}`;
      if (existsSync(p)) return p;
    }
  }
  return undefined;
}

const chromiumPath =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ?? localBrowser("chromium", "chrome-linux/chrome");
const firefoxPath = process.env.PLAYWRIGHT_FIREFOX_PATH ?? localBrowser("firefox", "firefox/firefox");
const webkitPath =
  process.env.PLAYWRIGHT_WEBKIT_PATH ??
  localBrowser("webkit", "pw_run.sh", "minibrowser-gtk/bin/MiniBrowser");

const launch = (path?: string) => (path ? { executablePath: path } : {});

/** End-to-end tests run against the already-running dev server. */
export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:8080",
    trace: "off",
    screenshot: "only-on-failure",
    launchOptions: launch(chromiumPath),
  },
  /**
   * The WhatsApp top-tab helper has to behave identically on every engine, so
   * the suite runs on Chromium (desktop + Android), Firefox and WebKit
   * (desktop Safari + iOS Safari). Narrow it down locally with
   * `npx playwright test --project=mobile-safari`.
   */
  projects: [
    { name: "chrome-android", use: { ...devices["Pixel 7"], channel: undefined } },
    { name: "desktop-chrome", use: { ...devices["Desktop Chrome"], channel: undefined } },
    { name: "desktop-firefox", use: { ...devices["Desktop Firefox"], launchOptions: launch(firefoxPath) } },
    // WebKit is skipped with E2E_SKIP_WEBKIT=1 on machines whose locally
    // installed WebKit build does not match this Playwright version.
    ...(process.env.E2E_SKIP_WEBKIT === "1"
      ? []
      : [
          { name: "desktop-safari", use: { ...devices["Desktop Safari"], launchOptions: launch(webkitPath) } },
          { name: "mobile-safari", use: { ...devices["iPhone 14"], launchOptions: launch(webkitPath) } },
        ]),
  ],

});

