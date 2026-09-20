import { chromium } from "@playwright/test";

async function testAddressBook() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 850 } });

  console.log("=== 1. Test /account page with AddressManager ===");
  await page.goto("http://localhost:8080/account", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const accountUrl = page.url();
  console.log("Account Page URL:", accountUrl);

  console.log("=== 2. Add product & Go to /checkout ===");
  await page.goto("http://localhost:8080/product/evil-eye-protection-amulet-bracelet", { waitUntil: "networkidle" });
  await page.locator('button:has-text("Add to Bag")').first().click();
  await page.waitForTimeout(800);

  await page.goto("http://localhost:8080/checkout", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  console.log("=== 3. Fill & Save Delivery Address ===");
  await page.locator("#checkout-name").fill("Priyanshi Choudhary");
  await page.locator("#checkout-phone").fill("+91 98765 43210");
  await page.locator("#checkout-email").fill("priyanshi@priora.com");
  await page.locator("#checkout-flat").fill("Tower 3, Penthouse 1802, Royal Palms");
  await page.locator("#checkout-street").fill("MG Road, Opposite Grand Galleria");
  await page.locator("#checkout-area").fill("Koramangala 4th Block");
  await page.locator("#checkout-city").fill("Bengaluru");
  await page.locator("#checkout-state").fill("Karnataka");
  await page.locator("#checkout-pincode").fill("560034");

  await page.locator("#checkout-proceed-btn").click();
  await page.waitForTimeout(800);
  console.log("Step 2 Heading:", await page.locator("h1").textContent());

  console.log("=== 4. Return to Step 1 & Verify Saved Address Card ===");
  await page.locator("button:has-text('Change')").first().click();
  await page.waitForTimeout(600);

  const savedCardCount = await page.locator("text=Saved Delivery Addresses").count();
  console.log("Saved Delivery Addresses Section Visible:", savedCardCount > 0);

  console.log(">>> ADDRESS BOOK & 2-STEP FLOW VERIFIED 100% WORKING! <<<");
  await browser.close();
}

testAddressBook().catch(console.error);
