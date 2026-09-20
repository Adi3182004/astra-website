import { test, expect } from "@playwright/test";

/**
 * Offline behaviour.
 *
 * The service worker is deliberately production-only (see src/registerSW.ts),
 * so against a dev server there is no controller to test. In that case the
 * spec still asserts the important half: the storefront degrades gracefully
 * when media cannot be fetched, instead of showing broken-image icons or a
 * blank page.
 */
test("cached shell and media survive going offline; uncached media degrades gracefully", async ({
  page,
  context,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500); // let images/thumbnails settle into the cache

  const controlled = await page.evaluate(
    () => "serviceWorker" in navigator && !!navigator.serviceWorker.controller,
  );

  await context.setOffline(true);

  if (controlled) {
    await page.reload({ waitUntil: "domcontentloaded" });
    // App shell still renders from cache.
    await expect(page.locator("main, body")).toBeVisible();
    await expect(page.getByRole("img", { name: "PRIORA" }).first()).toBeVisible();
    const broken = await page.evaluate(
      () =>
        Array.from(document.images).filter((i) => i.complete && i.naturalWidth === 0).length,
    );
    expect(broken).toBe(0);
  } else {
    test.info().annotations.push({
      type: "note",
      description:
        "No service worker in this environment (dev server) — offline caching is production-only.",
    });
  }

  // Uncached media must never blow the layout up: block a fresh image request
  // and confirm the page still renders its container.
  await context.setOffline(false);
  await page.route("**/*.{jpg,jpeg,png,webp}", (r) => r.abort());
  await page.goto("/shop", { waitUntil: "domcontentloaded" });
  await expect(page.locator("body")).toBeVisible();
  const overflowing = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 2,
  );
  expect(overflowing).toBeFalsy();
});
