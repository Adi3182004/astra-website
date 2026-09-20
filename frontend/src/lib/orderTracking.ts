export interface OrderTrackingInfo {
  carrier: string;
  articleNumber?: string;
  trackingUrl?: string;
  mode: "direct" | "sms_only" | "pending_dispatch";
  dispatchedAt?: string;
  dismissedAlert?: boolean;
  customDelayMessage?: string;
  cancelReason?: string;
  trashedAt?: string;
}

export const DEFAULT_TRACKING_URL = "https://www.indiapost.gov.in";

/**
 * Masks a phone number to only display the last 4 digits (e.g. 9876543210 -> xxxxxx3210).
 */
export function maskPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return "xxxxxx0000";
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  const last4 = digits.slice(-4);
  return `xxxxxx${last4}`;
}

/**
 * Extracts structured tracking info from an order object.
 */
export function extractOrderTracking(order: any): OrderTrackingInfo {
  if (!order) {
    return {
      carrier: "India Post",
      trackingUrl: DEFAULT_TRACKING_URL,
      mode: "pending_dispatch",
    };
  }

  // 1. Check if tracking info is directly on the order record
  if (order.tracking_info && typeof order.tracking_info === "object") {
    return {
      carrier: order.tracking_info.carrier || "India Post",
      articleNumber: order.tracking_info.articleNumber || "",
      trackingUrl: order.tracking_info.trackingUrl || DEFAULT_TRACKING_URL,
      mode: order.tracking_info.mode || (order.tracking_info.articleNumber ? "direct" : "pending_dispatch"),
      dispatchedAt: order.tracking_info.dispatchedAt,
      dismissedAlert: !!order.tracking_info.dismissedAlert,
      customDelayMessage: order.tracking_info.customDelayMessage,
      cancelReason: order.tracking_info.cancelReason,
      trashedAt: order.tracking_info.trashedAt,
    };
  }

  // 2. Check notes for serialized tracking metadata
  if (typeof order.notes === "string" && order.notes.includes("[PRIORA_TRACKING:")) {
    try {
      const match = order.notes.match(/\[PRIORA_TRACKING:\s*({.*?})\]/);
      if (match && match[1]) {
        const parsed = JSON.parse(match[1]);
        return {
          carrier: parsed.carrier || "India Post",
          articleNumber: parsed.articleNumber || "",
          trackingUrl: parsed.trackingUrl || DEFAULT_TRACKING_URL,
          mode: parsed.mode || (parsed.articleNumber ? "direct" : "pending_dispatch"),
          dispatchedAt: parsed.dispatchedAt,
          dismissedAlert: !!parsed.dismissedAlert,
          customDelayMessage: parsed.customDelayMessage,
          cancelReason: parsed.cancelReason,
          trashedAt: parsed.trashedAt,
        };
      }
    } catch (e) {
      console.warn("Could not parse order tracking metadata:", e);
    }
  }

  // 3. Fallback based on order status
  const isShipped = order.status === "shipped";
  return {
    carrier: "India Post",
    articleNumber: "",
    trackingUrl: DEFAULT_TRACKING_URL,
    mode: isShipped ? "sms_only" : "pending_dispatch",
    cancelReason: order.cancel_reason,
  };
}

/**
 * Encodes tracking information into order notes without destroying original user notes.
 */
export function encodeOrderNotesWithTracking(originalNotes: string | null | undefined, tracking: OrderTrackingInfo): string {
  const cleanNotes = (originalNotes || "").replace(/\[PRIORA_TRACKING:\s*({.*?})\]/g, "").trim();
  const trackingPayload = JSON.stringify(tracking);
  return cleanNotes ? `${cleanNotes} [PRIORA_TRACKING: ${trackingPayload}]` : `[PRIORA_TRACKING: ${trackingPayload}]`;
}

/**
 * Parses bracketed order notes into structured badges and clean customer notes.
 */
export function parseOrderMetaNotes(rawNotes: string | null | undefined): {
  cleanUserNotes: string;
  paymentTag?: string;
  paidTag?: string;
  offerTag?: string;
} {
  if (!rawNotes) return { cleanUserNotes: "" };

  let text = rawNotes.replace(/\[PRIORA_TRACKING:\s*({.*?})\]/g, "").trim();

  let paymentTag: string | undefined;
  let paidTag: string | undefined;
  let offerTag: string | undefined;

  // Extract [Payment: ...]
  const paymentMatch = text.match(/\[Payment:\s*([^\]]+)\]/i);
  if (paymentMatch) {
    paymentTag = paymentMatch[1].trim();
    text = text.replace(paymentMatch[0], "").trim();
  }

  // Extract [Razorpay Paid: ...]
  const paidMatch = text.match(/\[Razorpay Paid:\s*([^\]]+)\]/i);
  if (paidMatch) {
    paidTag = paidMatch[1].trim();
    text = text.replace(paidMatch[0], "").trim();
  }

  // Extract [Offer: ...]
  const offerMatch = text.match(/\[Offer:\s*([^\]]+)\]/i);
  if (offerMatch) {
    offerTag = offerMatch[1].trim();
    text = text.replace(offerMatch[0], "").trim();
  }

  // Clean any trailing separators
  const cleanUserNotes = text.replace(/^\|\s*|\s*\|\s*$/g, "").replace(/\s*\|\s*/g, " · ").trim();

  return { cleanUserNotes, paymentTag, paidTag, offerTag };
}

/**
 * Calculates dispatch alert status for an order based on working days / elapsed time.
 */
export function calculateDispatchAlert(order: any, tracking: OrderTrackingInfo): {
  isAlert: boolean;
  alertType: "due_today" | "delayed" | null;
  delayDays: number;
  message: string;
} {
  // If already dispatched, delivered, or cancelled, no alert
  if (
    order.status === "shipped" ||
    order.status === "delivered" ||
    order.status === "cancelled" ||
    tracking.mode === "direct" ||
    tracking.mode === "sms_only"
  ) {
    return { isAlert: false, alertType: null, delayDays: 0, message: "" };
  }

  const createdAt = new Date(order.created_at).getTime();
  const now = Date.now();
  const elapsedHours = (now - createdAt) / (1000 * 60 * 60);
  const elapsedDays = Math.floor(elapsedHours / 24);

  // If order is more than 48 hours (2 days) old -> Delayed Alert
  if (elapsedHours >= 48) {
    const delayDays = Math.max(1, elapsedDays - 1);
    return {
      isAlert: true,
      alertType: "delayed",
      delayDays,
      message: `🚨 Delayed Dispatch (${delayDays} day${delayDays > 1 ? "s" : ""} overdue — Action Required)`,
    };
  }

  // If order is between 24 and 48 hours old -> Day 1 Due Alert (unless dismissed by admin)
  if (elapsedHours >= 24) {
    if (tracking.dismissedAlert) {
      return { isAlert: false, alertType: null, delayDays: 0, message: "" };
    }
    return {
      isAlert: true,
      alertType: "due_today",
      delayDays: 0,
      message: `⚠️ Dispatch Due Today (Order placed >24 hours ago)`,
    };
  }

  return { isAlert: false, alertType: null, delayDays: 0, message: "" };
}

/**
 * Checks if order is in admin trash.
 */
export function isOrderTrashed(order: any): boolean {
  const tracking = extractOrderTracking(order);
  return !!tracking.trashedAt;
}

/**
 * Calculates remaining days in trash before permanent deletion (15 days TTL).
 */
export function getTrashDaysRemaining(order: any): number {
  const tracking = extractOrderTracking(order);
  if (!tracking.trashedAt) return 15;
  const trashedTime = new Date(tracking.trashedAt).getTime();
  const elapsedDays = (Date.now() - trashedTime) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(15 - elapsedDays));
}

/**
 * Checks if trash order has exceeded 15 days TTL.
 */
export function shouldAutoPurgeTrashOrder(order: any): boolean {
  const tracking = extractOrderTracking(order);
  if (!tracking.trashedAt) return false;
  const trashedTime = new Date(tracking.trashedAt).getTime();
  const elapsedDays = (Date.now() - trashedTime) / (1000 * 60 * 60 * 24);
  return elapsedDays >= 15;
}

