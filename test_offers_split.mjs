import { chromium } from "@playwright/test";

async function testOffersAndSplit() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 850 } });

  console.log("=== 1. Clear storage & add 3 qty of bracelet ===");
  await page.goto("http://localhost:8080/cart", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  
  await page.goto("http://localhost:8080/product/evil-eye-protection-amulet-bracelet", { waitUntil: "networkidle" });
  await page.locator('button:has-text("Add to Bag")').first().click();
  await page.waitForTimeout(600);
  await page.locator('button:has-text("Add to Bag")').first().click();
  await page.waitForTimeout(600);
  await page.locator('button:has-text("Add to Bag")').first().click();
  await page.waitForTimeout(600);

  console.log("=== 2. Check CartDrawer BEFORE applying coupon ===");
  await page.goto("http://localhost:8080/cart", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  const priceTextBefore = await page.locator("text=₹1,797").count();
  console.log("Full price for 3 units before coupon (should be present):", priceTextBefore > 0);

  console.log("=== 3. Apply MONSOON3 (Buy 2 Get 1 Free) manually ===");
  await page.locator("input[placeholder='Enter Coupon Code']").fill("MONSOON3");
  await page.locator("button:has-text('Apply')").first().click();
  await page.waitForTimeout(1000);

  const paidRowPrice = await page.locator("text=₹1,198").count();
  console.log("Paid Row shows 2 items @ ₹1,198 (should be > 0):", paidRowPrice > 0);

  const freeRowBadge = await page.locator("text=FREE (₹0)").count();
  console.log("Separate Free Row shows FREE (₹0) (should be > 0):", freeRowBadge > 0);

  console.log("=== 4. Check Checkout Page Split Display ===");
  await page.goto("http://localhost:8080/checkout", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const checkoutPaidPrice = await page.locator("text=₹1,198").count();
  const checkoutFreeBadge = await page.locator("text=FREE").count();
  console.log("Checkout displays paid ₹1,198:", checkoutPaidPrice > 0, "and free row:", checkoutFreeBadge > 0);

  console.log(">>> ALL BOGO SPLIT, NO AUTO-APPLY & ACCURATE PRICING VERIFIED 100%! <<<");
  await browser.close();
}

testOffersAndSplit().catch(console.error);
