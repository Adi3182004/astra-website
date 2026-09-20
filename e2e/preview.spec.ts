import { test, expect } from "@playwright/test";

/**
 * The admin preview frame: focusing one section, and the "unsaved changes"
 * draft bridge that renders edits before they are saved.
 */

test("preview frame blurs everything except the focused section", async ({ page }) => {
  await page.goto("/?__preview=1&focus=categories");
  const focused = page.locator('[data-preview="categories"]');
  await expect(focused).toBeVisible();

  const blurOf = (sel: string) =>
    page.locator(sel).first().evaluate((el) => getComputedStyle(el).filter);

  expect(await blurOf('[data-preview="categories"]')).toBe("none");
  const banners = page.locator('[data-preview="banners"]');
  if (await banners.count()) {
    expect(await blurOf('[data-preview="banners"]')).toContain("blur");
  }
});

test("unsaved admin edits appear in the preview frame", async ({ page }) => {
  // Seed a draft exactly like the admin form does, then open the preview URL.
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem(
      "priora:preview-draft",
      JSON.stringify({
        table: "categories",
        id: null,
        values: {
          name: "Draft Anklets",
          slug: "draft-anklets",
          image_url: "",
          is_active: true,
          sort_order: 0,
        },
      }),
    );
  });

  await page.goto("/?__preview=1&focus=categories&item=__draft");
  await expect(page.getByText("Draft Anklets").first()).toBeVisible();

  // The live storefront must not show the unsaved record.
  await page.goto("/");
  await expect(page.getByText("Draft Anklets")).toHaveCount(0);
});
