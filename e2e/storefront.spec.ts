import { test, expect } from "@playwright/test";

/**
 * Storefront end-to-end coverage: product SEO tags, the delivery (pincode)
 * dialog, and the WhatsApp hand-off used for orders and support.
 */

async function firstProductSlug(page: import("@playwright/test").Page) {
  await page.goto("/shop");
  const link = page.locator('a[href^="/product/"]').first();
  await expect(link).toBeVisible();
  return (await link.getAttribute("href"))!.replace("/product/", "");
}

test("product detail page renders full SEO metadata", async ({ page }) => {
  const slug = await firstProductSlug(page);
  await page.goto(`/product/${slug}`);
  await expect(page.locator("h1")).toBeVisible();

  const title = await page.title();
  expect(title.length).toBeGreaterThan(10);
  expect(title.toLowerCase()).not.toContain("lovable");

  const meta = (sel: string) => page.locator(sel).first().getAttribute("content");
  expect((await meta('meta[name="description"]'))?.length ?? 0).toBeGreaterThan(20);
  expect(await meta('meta[property="og:title"]')).toBeTruthy();
  expect(await meta('meta[property="og:type"]')).toBe("product");
  expect(await meta('meta[name="twitter:card"]')).toBe("summary_large_image");

  const canonical = await page.locator('link[rel="canonical"]').first().getAttribute("href");
  expect(canonical).toContain(`/product/${slug}`);

  const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
  const json = JSON.parse(ld ?? "{}");
  expect(json["@type"]).toBe("Product");
  expect(json.offers?.priceCurrency).toBe("INR");
});

test("delivery lookup stays open and answers the pincode", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /pincode|deliver/i }).first().click();

  const input = page.getByPlaceholder(/pincode/i).first();
  await expect(input).toBeVisible();
  await input.fill("400001");
  await page.getByRole("button", { name: /check/i }).first().click();

  // The dialog must remain open and show a verdict.
  await expect(input).toBeVisible();
  await expect(page.getByText(/deliver|not there yet|oops/i).first()).toBeVisible();
});

test("WhatsApp hand-off uses the brand username and never a phone number", async ({ page }) => {
  await page.goto("/");
  const html = await page.content();
  expect(html).not.toContain("7887547146");

  const bundle = await page.request.get("/src/lib/whatsapp.ts");
  if (bundle.ok()) {
    const src = await bundle.text();
    expect(src).toContain("AdityaAndhalkar");
    expect(src).not.toMatch(/\b\d{10,}\b/);
  }
});

test("storefront never shows admin tutorials", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: /tutorial/i })).toHaveCount(0);
});
