/**
 * Vercel Serverless Function: Create Razorpay Order
 * Securely creates a Razorpay payment order server-side without exposing KEY_SECRET
 */

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
    const { amount, receipt, notes = {} } = req.body || {};

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount specified" });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TUs4bExPzn33IR";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "8MRx7cz4cZVkNCOQLAI61g1D";

    if (!keyId || !keySecret) {
      return res.status(500).json({
        error: "Razorpay keys not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.",
      });
    }

    // Convert INR to paise (e.g., ₹999 -> 99900 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: receipt || `rcpt_${Date.now()}`,
        notes: {
          brand: "PRIORA by KP",
          ...notes,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Razorpay order creation error:", data);
      return res.status(response.status).json({
        error: data.error?.description || "Failed to create Razorpay order",
      });
    }

    return res.status(200).json({
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId: keyId,
      receipt: data.receipt,
    });
  } catch (err) {
    console.error("Razorpay Create Order Exception:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
