/**
 * Razorpay Client-Side Integration Helper for PRIORA by KP
 */

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  keyId: string;
  receipt?: string;
}

export interface RazorpayPaymentSuccessData {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/**
 * Lazy loads the Razorpay checkout script from official CDN
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Calls backend to create a secure Razorpay order
 */
export async function createRazorpayOrder(
  amount: number,
  receipt: string,
  notes: Record<string, string> = {}
): Promise<RazorpayOrderResponse> {
  const res = await fetch("/api/razorpay-create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, receipt, notes }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to initialize payment order");
  }
  return data;
}

/**
 * Calls backend to verify cryptographic HMAC-SHA256 signature
 */
export async function verifyRazorpayPayment(
  payload: RazorpayPaymentSuccessData & { supabase_order_id?: string }
): Promise<{ success: boolean; message?: string }> {
  const res = await fetch("/api/razorpay-verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Payment verification failed");
  }
  return data;
}

/**
 * Opens Razorpay Checkout Modal
 */
export async function openRazorpayCheckout(opts: {
  orderId: string;
  keyId: string;
  amount: number;
  name: string;
  email?: string;
  phone?: string;
  description?: string;
  onSuccess: (data: RazorpayPaymentSuccessData) => void;
  onFailure?: (error: any) => void;
  onDismiss?: () => void;
}) {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    throw new Error("Could not load payment gateway. Please check your internet connection.");
  }

  const rzpOptions = {
    key: opts.keyId,
    amount: opts.amount,
    currency: "INR",
    name: "PRIORA by KP",
    description: opts.description || "Handcrafted Luxury Jewellery",
    image: "/favicon.png",
    order_id: opts.orderId,
    prefill: {
      name: opts.name,
      email: opts.email || "",
      contact: opts.phone || "",
    },
    theme: {
      color: "#E06A8B", // Priora Signature Peach/Rose
    },
    modal: {
      ondismiss: () => {
        if (opts.onDismiss) opts.onDismiss();
      },
    },
    handler: function (response: any) {
      opts.onSuccess({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
      });
    },
  };

  const razorpayInstance = new window.Razorpay(rzpOptions);
  razorpayInstance.on("payment.failed", function (response: any) {
    console.error("Payment failed:", response.error);
    if (opts.onFailure) {
      opts.onFailure(response.error);
    }
  });
  razorpayInstance.open();
}
