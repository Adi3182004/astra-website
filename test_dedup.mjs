import { chromium } from "@playwright/test";

async function testAddressDeduplicationAndCardsView() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 850 } });

  console.log("=== 1. Setup Cart with 1 item ===");
  await page.goto("http://localhost:8080/cart", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());

  await page.goto("http://localhost:8080/product/evil-eye-protection-amulet-bracelet", { waitUntil: "domcontentloaded" });
  await page.locator('button:has-text("Add to Bag")').first().click();
  await page.waitForTimeout(600);

  console.log("=== 2. Navigate to Checkout ===");
  await page.goto("http://localhost:8080/checkout", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);

  console.log("=== 3. Fill first address: Sakshi Park ===");
  await page.locator("input[placeholder='e.g. Priya Sharma']").fill("Aditya Andhalkar");
  await page.locator("input[placeholder='10-digit mobile number']").fill("7887547146");
  await page.locator("input[placeholder*='Flat']").fill("Sakshi Park");
  await page.locator("input[placeholder*='Street']").fill("Wai");
  await page.locator("input[placeholder*='Area']").fill("naagr");
  await page.locator("input[placeholder*='City']").fill("Wai");
  await page.locator("input[placeholder*='State']").fill("Maharashtra");
  await page.locator("input[placeholder*='Pincode']").fill("412803");

  console.log("=== 4. Click 'Continue to Payment' ===");
  await page.locator('button:has-text("Continue to Payment")').first().click();
  await page.waitForTimeout(1000);

  console.log("=== 5. From Step 2, click '1. Address' or 'Change' ===");
  await page.locator('button:has-text("1. Address")').first().click();
  await page.waitForTimeout(800);

  const cardsCount = await page.locator("text=Deliver Here").count();
  console.log("Active 'Deliver Here' card is present in Saved Cards view:", cardsCount > 0);

  const sakshiParkCards = await page.locator("text=Sakshi Park, Wai").count();
  console.log("Sakshi Park card count (MUST BE EXACTLY 1, NO DUPLICATE):", sakshiParkCards);

  console.log("=== 6. Click 'Continue to Payment' AGAIN and check for duplicates ===");
  await page.locator('button:has-text("Continue to Payment")').first().click();
  await page.waitForTimeout(1000);

  await page.locator('button:has-text("1. Address")').first().click();
  await page.waitForTimeout(800);

  const sakshiParkCardsAfter = await page.locator("text=Sakshi Park, Wai").count();
  console.log("Sakshi Park card count after 2nd continue (MUST STILL BE EXACTLY 1):", sakshiParkCardsAfter);

  if (sakshiParkCardsAfter === 1) {
    console.log(">>> SUCCESS: DEDUPLICATION AND SAVED CARDS VIEW 100% VERIFIED! <<<");
  } else {
    console.error(">>> FAILED: Duplicate detected! Count is:", sakshiParkCardsAfter);
  }

  await browser.close();
}

testAddressDeduplicationAndCardsView().catch(console.error);
