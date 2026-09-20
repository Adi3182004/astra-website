import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = (match[2] || "").trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[match[1]] = val;
      }
    }
  }
} catch (e) {}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://oriibywxhetfpcpstdyk.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function autoCleanup() {
  console.log("🧹 Running Database Auto-Cleanup & Pruning...\n");

  const now = new Date();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString();

  // 1. Abandoned / Unpaid Checkouts older than 60 days
  const { data: abandoned, error: err1 } = await supabase
    .from("orders")
    .select("id, contact_name, subtotal, created_at")
    .eq("status", "new")
    .lt("created_at", sixtyDaysAgo);

  let abandonedDeleted = 0;
  if (!err1 && abandoned && abandoned.length > 0) {
    const ids = abandoned.map((o) => o.id);
    await supabase.from("orders").delete().in("id", ids);
    abandonedDeleted = ids.length;
  }

  // 2. Cancelled / Test Orders older than 30 days
  const { data: cancelled, error: err2 } = await supabase
    .from("orders")
    .select("id, contact_name, subtotal, created_at")
    .eq("status", "cancelled")
    .lt("created_at", thirtyDaysAgo);

  let cancelledDeleted = 0;
  if (!err2 && cancelled && cancelled.length > 0) {
    const ids = cancelled.map((o) => o.id);
    await supabase.from("orders").delete().in("id", ids);
    cancelledDeleted = ids.length;
  }

  // 3. Expired Promo Codes older than 6 months
  let promosDeleted = 0;
  try {
    const { data: expired } = await supabase
      .from("coupons")
      .select("id")
      .lt("expires_at", sixMonthsAgo);

    if (expired && expired.length > 0) {
      const ids = expired.map((c) => c.id);
      await supabase.from("coupons").delete().in("id", ids);
      promosDeleted = ids.length;
    }
  } catch (e) {}

  console.log("=================================================");
  console.log("📊 AUTO-CLEANUP SUMMARY:");
  console.log("=================================================");
  console.log(` • Abandoned Checkouts Deleted (60+ days old): ${abandonedDeleted}`);
  console.log(` • Cancelled / Test Orders Deleted (30+ days old): ${cancelledDeleted}`);
  console.log(` • Expired Promo Codes Deleted (180+ days old): ${promosDeleted}`);
  console.log(` • Total Records Pruned: ${abandonedDeleted + cancelledDeleted + promosDeleted}`);
  console.log("=================================================");
  console.log("✅ Database is clean and optimized!");
}

autoCleanup();
