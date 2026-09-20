import { test, expect } from "@playwright/test";

/**
 * WhatsApp must always open as a REAL top-level tab (never inside a frame,
 * where api.whatsapp.com's `X-Frame-Options: DENY` causes
 * ERR_BLOCKED_BY_RESPONSE), and must always use the brand username — no phone
 * number may ever appear in the URL.
 *
 * This spec runs on every project in playwright.config.ts:
 * chrome-android, desktop-chrome, desktop-firefox, desktop-safari, mobile-safari.
 */
const NUMBERLESS = (url: string) => !/\d{8,}/.test(url);

test("footer WhatsApp opens a top-level tab with the username only", async ({ context, page }) => {
  await page.goto("/");
  const btn = page.getByLabel("Chat with us on WhatsApp");
  await btn.scrollIntoViewIfNeeded();
  const [popup] = await Promise.all([context.waitForEvent("page"), btn.click()]);
  const url = popup.url();
  expect(url).toContain("AdityaAndhalkar");
  expect(NUMBERLESS(url)).toBeTruthy();
});

test("WhatsApp escapes an embedded preview frame", async ({ context, page }) => {
  await page.route("**/wa-frame-host", (r) =>
    r.fulfill({
      contentType: "text/html",
      body: `<html><body style="margin:0"><iframe id="f" src="/" style="width:420px;height:900px;border:0"></iframe></body></html>`,
    }),
  );
  await page.goto("/wa-frame-host");
  const frame = page.frameLocator("#f");
  const btn = frame.getByLabel("Chat with us on WhatsApp");
  await btn.scrollIntoViewIfNeeded();
  const [popup] = await Promise.all([context.waitForEvent("page"), btn.click()]);
  await popup.waitForLoadState("domcontentloaded");
  expect(popup.url()).toContain("username=AdityaAndhalkar");
  expect(NUMBERLESS(popup.url())).toBeTruthy();
});

test("the opened WhatsApp document is never blocked by X-Frame-Options", async ({
  context,
  page,
}) => {
  await page.goto("/");
  const btn = page.getByLabel("Chat with us on WhatsApp");
  await btn.scrollIntoViewIfNeeded();
  const [popup] = await Promise.all([context.waitForEvent("page"), btn.click()]);
  await popup.waitForLoadState("domcontentloaded").catch(() => {});
  // A blocked response renders Chrome's error page, whose body carries the code.
  const body = await popup.textContent("body").catch(() => "");
  expect(body ?? "").not.toContain("ERR_BLOCKED_BY_RESPONSE");
  // It is a genuine top-level document: no parent frame.
  expect(await popup.evaluate(() => window.self === window.top)).toBeTruthy();
});
