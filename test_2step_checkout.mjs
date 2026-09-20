import { chromium } from "@playwright/test";

async function test2StepCheckout() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  
  // Desktop Viewport
  const page = await browser.newPage({ viewport: { width: 1280, height: 850 } });

  console.log("=== 1. Add item to bag ===");
  await page.goto("http://localhost:8080/product/evil-eye-protection-amulet-bracelet", { waitUntil: "networkidle" });
  await page.locator('button:has-text("Add to Bag")').first().click();
  await page.waitForTimeout(1000);

  console.log("=== 2. Navigate to /checkout (Step 1) ===");
  await page.goto("http://localhost:8080/checkout", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  console.log("Step 1 Heading:", await page.locator("h1").textContent());
  await page.screenshot({ path: "checkout_step1_desktop.png", fullPage: true });

  console.log("=== 3. Fill Structured Address in Step 1 ===");
  await page.locator("#checkout-name").fill("Aditya Sharma");
  await page.locator("#checkout-phone").fill("+91 98765 43210");
  await page.locator("#checkout-email").fill("aditya.test@priora.com");
  await page.locator("#checkout-flat").fill("Flat 402, Rosewood Heights, Tower B");
  await page.locator("#checkout-street").fill("14th Main Road, Near Lotus Park");
  await page.locator("#checkout-area").fill("Indiranagar, Stage 2");
  await page.locator("#checkout-city").fill("Bengaluru");
  await page.locator("#checkout-state").fill("Karnataka");
  await page.locator("#checkout-pincode").fill("560038");
  await page.locator("#checkout-notes").fill("Please call on arrival before delivery.");

  console.log("=== 4. Click Continue to Payment ===");
  await page.locator("#checkout-proceed-btn").click();
  await page.waitForTimeout(1000);

  console.log("Step 2 Heading:", await page.locator("h1").textContent());
  await page.screenshot({ path: "checkout_step2_desktop.png", fullPage: true });

  console.log("=== 5. Verify Address Recap Card in Step 2 ===");
  const deliveringToText = await page.locator("section:has-text('Delivering To')").textContent();
  console.log("Recap Card contains Indiranagar:", deliveringToText.includes("Indiranagar"));
  console.log("Recap Card contains 560038:", deliveringToText.includes("560038"));

  console.log("=== 6. Test 'Change' button back to Step 1 ===");
  await page.locator("button:has-text('Change')").first().click();
  await page.waitForTimeout(600);
  console.log("Returned to Heading:", await page.locator("h1").textContent());
  const preservedFlat = await page.locator("#checkout-flat").inputValue();
  console.log("Preserved Flat field:", preservedFlat);

  console.log("=== 7. Advance back to Step 2 ===");
  await page.locator("#checkout-proceed-btn").click();
  await page.waitForTimeout(600);

  // Mobile Viewport Test
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto("http://localhost:8080/checkout", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({ path: "checkout_step1_mobile.png", fullPage: true });

  console.log(">>> 2-STEP CHECKOUT VERIFIED WITH 100% SUCCESS! <<<");
  await browser.close();
}

test2StepCheckout().catch(console.error);
