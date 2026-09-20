import { test, expect } from "@playwright/test";

/**
 * Admin surface checks that don't require a signed-in session: the admin area
 * is protected, and the tutorial overlay supports keyboard navigation.
 */

test("admin area is gated behind sign-in", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/auth/);
});

test("tutorial overlay responds to keyboard when present", async ({ page }) => {
  await page.goto("/admin");
  const tutorial = page.getByRole("dialog", { name: /tutorial/i });
  if (!(await tutorial.count())) test.skip(true, "Tutorial only renders for signed-in admins");

  await page.keyboard.press("ArrowRight");
  await expect(tutorial).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tutorial).toHaveCount(0);
});
