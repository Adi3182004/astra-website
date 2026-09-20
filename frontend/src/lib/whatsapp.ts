/**
 * Single place that knows the brand's WhatsApp identity.
 *
 * IDENTITY
 * --------
 * The brand is reached by WhatsApp *username* — `priorabykp`. No phone
 * number exists anywhere in this project, in the markup, in an `href` a visitor
 * could copy, or in the URL that finally opens:
 *
 *   https://wa.me/priorabykp
 *     → 302 https://api.whatsapp.com/send/?text=…&username=priorabykp&type=username
 *
 * WHY IT USED TO SAY "api.whatsapp.com refused to connect / ERR_BLOCKED_BY_RESPONSE"
 * ---------------------------------------------------------------------------------
 * That redirect target answers with `X-Frame-Options: DENY`. The link itself was
 * always fine — the problem was that the navigation happened inside a frame
 * (hosting preview, admin section preview, in-app browser webview), and a framed
 * navigation to a DENY response is refused by the browser.
 *
 * THE FIX
 * -------
 * Never navigate the current frame. `openTopTab` opens a genuine top-level tab
 * and only ever falls back to escaping the frame, so WhatsApp is loaded as a
 * top-level document on every browser and device — desktop (WhatsApp Web /
 * Desktop) and mobile (app hand-off).
 */
import { openTopTab } from "./openTopTab";

/** The brand's WhatsApp username. */
const WA_USERNAME = "priorabykp";

/** Display handle for UI copy. */
export const WHATSAPP_HANDLE = WA_USERNAME;

/** Universal deep link — WhatsApp decides app vs. WhatsApp Web on the other side. */
export function waLink(message?: string) {
  const q = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${WA_USERNAME}${q}`;
}

/** Opens WhatsApp with an optional prefilled message. Always in a top-level tab. */
export function openWhatsApp(message?: string) {
  return openTopTab(waLink(message));
}

export type ShareItem = {
  name: string;
  qty: number;
  price: number;
  image?: string;
  slug?: string;
};

/** Amazon/Flipkart-style rich product share block: name, qty, price, link and image. */
export function buildProductShare(items: ShareItem[], opts?: { origin?: string }) {
  const origin = opts?.origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return items
    .map((i) => {
      const lines = [
        `• *${i.name}*`,
        `  Qty: ${i.qty}  ·  ₹${(i.price * i.qty).toLocaleString("en-IN")}`,
        i.slug ? `  ${origin}/product/${i.slug}` : "",
        i.image ? `  ${i.image}` : "",
      ];
      return lines.filter(Boolean).join("\n");
    })
    .join("\n\n");
}
