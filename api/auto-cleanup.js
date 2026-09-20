/**
 * Automated Database Cleanup API (Vercel Serverless Function & Scheduled Cron)
 * 
 * Safely auto-prunes temporary junk data to keep Supabase database fast, tidy, and well within free limits:
 * 1. Abandoned / Unpaid checkouts (status: 'new') older than 60 days.
 * 2. Cancelled / Test orders (status: 'cancelled') older than 30 days.
 * 3. Expired coupons/promos (if table exists) older than 180 days (6 months).
 * 
 * NOTE: Valid paid, confirmed, shipped, and delivered customer orders are NEVER deleted.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://oriibywxhetfpcpstdyk.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (!SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured" });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const isDryRun = req.query?.dryRun === "true" || req.body?.dryRun === true;
  const now = new Date();

  // Date thresholds
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString();

  const report = {
    executedAt: now.toISOString(),
    mode: isDryRun ? "DRY_RUN (Preview)" : "LIVE_CLEANUP",
    abandonedOrdersPruned: 0,
    cancelledOrdersPruned: 0,
    expiredPromosPruned: 0,
    details: [],
  };

  try {
    // 1. Find & Prune Abandoned / Unpaid Checkouts (status = 'new' & created > 60 days ago)
    const { data: abandonedOrders, error: err1 } = await supabase
      .from("orders")
      .select("id, contact_name, subtotal, created_at, status")
      .eq("status", "new")
      .lt("created_at", sixtyDaysAgo);

    if (err1) throw err1;

    if (abandonedOrders && abandonedOrders.length > 0) {
      report.abandonedOrdersPruned = abandonedOrders.length;
      report.details.push({
        type: "abandoned_unpaid_checkouts_60d+",
        count: abandonedOrders.length,
        orderIds: abandonedOrders.map((o) => o.id),
      });

      if (!isDryRun) {
        const ids = abandonedOrders.map((o) => o.id);
        const { error: delErr1 } = await supabase.from("orders").delete().in("id", ids);
        if (delErr1) console.error("Failed to delete abandoned orders:", delErr1);
      }
    }

    // 2. Find & Prune Cancelled / Test Orders (status = 'cancelled' & created > 30 days ago)
    const { data: cancelledOrders, error: err2 } = await supabase
      .from("orders")
      .select("id, contact_name, subtotal, created_at, status")
      .eq("status", "cancelled")
      .lt("created_at", thirtyDaysAgo);

    if (err2) throw err2;

    if (cancelledOrders && cancelledOrders.length > 0) {
      report.cancelledOrdersPruned = cancelledOrders.length;
      report.details.push({
        type: "cancelled_test_orders_30d+",
        count: cancelledOrders.length,
        orderIds: cancelledOrders.map((o) => o.id),
      });

      if (!isDryRun) {
        const ids = cancelledOrders.map((o) => o.id);
        const { error: delErr2 } = await supabase.from("orders").delete().in("id", ids);
        if (delErr2) console.error("Failed to delete cancelled orders:", delErr2);
      }
    }

    // 3. Find & Prune Expired Coupons / Promos (> 6 months expired, if table exists)
    try {
      const { data: expiredCoupons } = await supabase
        .from("coupons")
        .select("id, code, expires_at")
        .lt("expires_at", sixMonthsAgo);

      if (expiredCoupons && expiredCoupons.length > 0) {
        report.expiredPromosPruned = expiredCoupons.length;
        if (!isDryRun) {
          const ids = expiredCoupons.map((c) => c.id);
          await supabase.from("coupons").delete().in("id", ids);
        }
      }
    } catch (e) {
      // coupons table may not exist yet, safely skip
    }

    return res.status(200).json({
      success: true,
      message: isDryRun
        ? "Dry run completed. No data was deleted."
        : "Database auto-cleanup completed successfully.",
      summary: {
        abandonedCheckoutsPruned: report.abandonedOrdersPruned,
        cancelledOrdersPruned: report.cancelledOrdersPruned,
        expiredPromosPruned: report.expiredPromosPruned,
        totalPruned: report.abandonedOrdersPruned + report.cancelledOrdersPruned + report.expiredPromosPruned,
      },
      report,
    });
  } catch (err) {
    console.error("Database auto-cleanup error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to execute database auto-cleanup",
    });
  }
}
