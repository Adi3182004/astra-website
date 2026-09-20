import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

async function main() {
  const svgPath = path.resolve("frontend/public/priora-logo.svg");
  const svgContent = fs.readFileSync(svgPath, "utf-8");

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1309, height: 360 } });

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0; padding:0; background:transparent;">
        ${svgContent}
      </body>
    </html>
  `);

  const pngPath = path.resolve("frontend/public/priora-logo.png");
  await page.locator("svg").screenshot({ path: pngPath, omitBackground: true });
  await browser.close();

  const pngBuffer = fs.readFileSync(pngPath);
  console.log(`Generated ${pngPath} (${pngBuffer.length} bytes)`);

  const base64 = pngBuffer.toString("base64");
  fs.writeFileSync(path.resolve("frontend/public/priora-logo-base64.txt"), base64);
  console.log("Saved base64 data");
}

main().catch(console.error);
