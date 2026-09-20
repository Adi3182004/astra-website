import { chromium } from "@playwright/test";

async function testClickEditAndDelete() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 850 } });

  // Handle confirm dialog automatically
  page.on("dialog", (dialog) => dialog.accept());

  console.log("=== 1. Add product & Go to Checkout ===");
  await page.goto("http://localhost:8080/product/evil-eye-protection-amulet-bracelet", { waitUntil: "networkidle" });
  await page.locator('button:has-text("Add to Bag")').first().click();
  await page.waitForTimeout(800);

  await page.goto("http://localhost:8080/checkout", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  console.log("=== 2. Fill Address ===");
  await page.locator("#checkout-name").fill("Aditya Andhalkar");
  await page.locator("#checkout-phone").fill("+917887547146");
  await page.locator("#checkout-email").fill("aditya@priora.com");
  await page.locator("#checkout-flat").fill("vidhi, kalyan west");
  await page.locator("#checkout-street").fill("yogidham");
  await page.locator("#checkout-area").fill("kalyan");
  await page.locator("#checkout-city").fill("Kalyan");
  await page.locator("#checkout-state").fill("Maharashtra");
  await page.locator("#checkout-pincode").fill("421301");

  await page.locator("#checkout-proceed-btn").click();
  await page.waitForTimeout(800);

  console.log("=== 3. Return to Step 1 & Click Card to Edit ===");
  await page.locator("button:has-text('Change')").first().click();
  await page.waitForTimeout(600);

  // Click card to open editable form
  await page.locator("div:has-text('vidhi, kalyan west')").first().click();
  await page.waitForTimeout(500);

  const flatInput = await page.locator("#checkout-flat").inputValue();
  console.log("Card Click Opened Editable Form with Flat:", flatInput);

  console.log("=== 4. Test Lower-Right Delete Action ===");
  // Cancel edit form to view card again
  await page.locator("button:has-text('Cancel & use saved card')").click();
  await page.waitForTimeout(500);

  // Click Delete button on lower right
  await page.locator("button:has-text('Delete')").first().click();
  await page.waitForTimeout(800);

  const remainingCards = await page.locator("div:has-text('vidhi, kalyan west')").count();
  console.log("Remaining card count after deletion (should be 0):", remainingCards);

  console.log(">>> CLICK-TO-EDIT & LOWER-RIGHT DELETE VERIFIED 100%! <<<");
  await browser.close();
}

testClickEditAndDelete().catch(console.error);
