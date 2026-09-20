/**
 * Vercel Serverless Function: Verify Razorpay Payment Signature
 * Cryptographically verifies HMAC SHA-256 signature and updates order in Supabase
 */

import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://oriibywxhetfpcpstdyk.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaWlieXd4aGV0ZnBjcHN0ZHlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3ODg2NCwiZXhwIjoyMTAzMTU0ODY0fQ.FmvPAosH_ulw5EDz-9CJKZo_t0T3U_fcFuw3dBpgSIs";

const sbAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      supabase_order_id,
    } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required payment verification parameters" });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "8MRx7cz4cZVkNCOQLAI61g1D";
    if (!keySecret) {
      return res.status(500).json({ error: "RAZORPAY_KEY_SECRET is not configured on server" });
    }

    // Cryptographic signature verification: HMAC-SHA256(order_id + "|" + payment_id, secret)
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      console.error("Razorpay signature mismatch! Expected:", expectedSignature, "Received:", razorpay_signature);
      return res.status(400).json({ error: "Invalid payment signature verification failed", verified: false });
    }

    // Update the order in Supabase if supabase_order_id provided
    if (supabase_order_id) {
      try {
        const { data: existingOrder } = await sbAdmin
          .from("orders")
          .select("notes")
          .eq("id", supabase_order_id)
          .maybeSingle();

        const existingNotes = existingOrder?.notes || "";
        const updatedNotes = existingNotes
          ? `${existingNotes} | [Razorpay Paid: ${razorpay_payment_id}]`
          : `[Razorpay Paid: ${razorpay_payment_id}]`;

        await sbAdmin
          .from("orders")
          .update({
            status: "confirmed",
            notes: updatedNotes,
          })
          .eq("id", supabase_order_id);
      } catch (dbErr) {
        console.warn("Could not update order status in database:", dbErr);
      }
    }

    return res.status(200).json({
      success: true,
      verified: true,
      razorpay_payment_id,
      razorpay_order_id,
      message: "Payment verified successfully",
    });
  } catch (err) {
    console.error("Razorpay Verification Exception:", err);
    return res.status(500).json({ error: err.message || "Internal server error during verification" });
  }
}
