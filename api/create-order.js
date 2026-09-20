/**
 * Vercel Serverless Function: Create Supabase Order
 * Uses service role key to bypass RLS and insert orders reliably.
 * This handles both guest and logged-in user order creation.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://oriibywxhetfpcpstdyk.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaWlieXd4aGV0ZnBjcHN0ZHlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3ODg2NCwiZXhwIjoyMTAzMTU0ODY0fQ.FmvPAosH_ulw5EDz-9CJKZo_t0T3U_fcFuw3dBpgSIs";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { payload } = req.body || {};

    if (!payload) {
      return res.status(400).json({ error: "Missing order payload" });
    }

    // Validate required fields
    if (!payload.contact_name || !payload.phone || !payload.subtotal) {
      return res.status(400).json({ error: "Missing required order fields" });
    }

    // Use service role to bypass RLS
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: orderData, error } = await supabase
      .from("orders")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Order insert error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ order: orderData });
  } catch (err) {
    console.error("Create Order Exception:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
