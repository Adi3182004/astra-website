import { chromium } from "@playwright/test";

async function saveScreenshots() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  
  // Desktop Viewport
  const page = await browser.newPage({ viewport: { width: 1280, height: 850 } });
  await page.goto("http://localhost:8080/product/evil-eye-protection-amulet-bracelet", { waitUntil: "networkidle" });
  await page.locator('button:has-text("Add to Bag")').first().click();
  await page.waitForTimeout(1000);

  await page.goto("http://localhost:8080/checkout", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: "C:/Users/adity/.gemini/antigravity-ide/brain/a57de51b-545b-41f4-b1ee-f4a577fb5a55/checkout_step1_desktop.png", fullPage: true });

  await page.locator("#checkout-name").fill("Aditya Sharma");
  await page.locator("#checkout-phone").fill("+91 98765 43210");
  await page.locator("#checkout-email").fill("aditya.test@priora.com");
  await page.locator("#checkout-flat").fill("Flat 402, Rosewood Heights, Tower B");
  await page.locator("#checkout-street").fill("14th Main Road, Near Lotus Park");
  await page.locator("#checkout-area").fill("Indiranagar, Stage 2");
  await page.locator("#checkout-city").fill("Bengaluru");
  await page.locator("#checkout-state").fill("Karnataka");
  await page.locator("#checkout-pincode").fill("560038");

  await page.locator("#checkout-proceed-btn").click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: "C:/Users/adity/.gemini/antigravity-ide/brain/a57de51b-545b-41f4-b1ee-f4a577fb5a55/checkout_step2_desktop.png", fullPage: true });

  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto("http://localhost:8080/checkout", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({ path: "C:/Users/adity/.gemini/antigravity-ide/brain/a57de51b-545b-41f4-b1ee-f4a577fb5a55/checkout_step1_mobile.png", fullPage: true });

  await browser.close();
}

saveScreenshots().catch(console.error);
