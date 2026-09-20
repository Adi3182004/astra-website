import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const sb = createClient(
  "https://oriibywxhetfpcpstdyk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaWlieXd4aGV0ZnBjcHN0ZHlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3ODg2NCwiZXhwIjoyMTAzMTU0ODY0fQ.FmvPAosH_ulw5EDz-9CJKZo_t0T3U_fcFuw3dBpgSIs"
);

const svgContent = fs.readFileSync("frontend/public/priora-logo.svg", "utf-8");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 300 }, deviceScaleFactor: 2 });

await page.setContent(`
  <!DOCTYPE html>
  <html>
  <body style="margin: 0; padding: 0; background: transparent; display: flex; align-items: center; justify-content: center;">
    <div id="logo" style="display: inline-block; width: 654px; height: 180px;">
      ${svgContent}
    </div>
  </body>
  </html>
`);

const element = await page.$("#logo");
const pngBuffer = await element.screenshot({ type: "png", omitBackground: true });
await browser.close();

fs.writeFileSync("frontend/public/priora-logo.png", pngBuffer);
console.log("Generated frontend/public/priora-logo.png, size:", pngBuffer.length);

const { data: uploadPng, error: errPng } = await sb.storage
  .from("public-assets")
  .upload("priora-logo.png", pngBuffer, { contentType: "image/png", upsert: true });

console.log("PNG uploaded to Supabase:", errPng ? errPng : uploadPng);

const { data: urlPng } = sb.storage.from("public-assets").getPublicUrl("priora-logo.png");
console.log("Public PNG CDN URL:", urlPng.publicUrl);
