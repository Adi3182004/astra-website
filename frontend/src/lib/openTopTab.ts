/**
 * Opens an external URL in a REAL top-level browsing context.
 *
 * WHY THIS EXISTS
 * ---------------
 * Some destinations (WhatsApp being the obvious one) answer with
 * `X-Frame-Options: DENY`. If such a URL is ever loaded *inside* a frame the
 * browser refuses the response with `ERR_BLOCKED_BY_RESPONSE`. Our storefront
 * runs inside a frame in several perfectly normal situations:
 *
 *   • the Lovable / hosting preview frame
 *   • the admin "section preview" frame
 *   • in-app browsers (Instagram, Facebook) that host pages in a webview frame
 *
 * So a plain `<a href>` or `location.href` is never safe. This helper walks a
 * ladder of escape hatches, each one degrading into the next, and stops at the
 * first that succeeds.
 *
 * 1. `window.open(_blank)` — a brand new top-level tab. Works everywhere the
 *    call happens inside a user gesture (all our call sites are click handlers).
 * 2. A synthetic `<a target="_blank" rel="noopener">` click — some engines
 *    allow this when programmatic `window.open` is throttled.
 * 3. A synthetic `<a target="_top">` click — leaves the frame entirely by
 *    navigating the top document (allowed for same-origin tops and for frames
 *    with top-navigation permission).
 * 4. `window.top.location` and finally `window.location` — last resorts.
 */
export function openTopTab(url: string): boolean {
  // 1 — new top-level tab
  try {
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (win) {
      try {
        win.opener = null;
      } catch {
        /* already detached by noopener */
      }
      return true;
    }
  } catch {
    /* popup blocked — keep going */
  }

  // 2 / 3 — synthetic anchor, first as a new tab, then breaking out of the frame
  for (const target of ["_blank", "_top"] as const) {
    try {
      const a = document.createElement("a");
      a.href = url;
      a.target = target;
      a.rel = "noopener noreferrer";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
      return true;
    } catch {
      /* try the next target */
    }
  }

  // 4 — navigate the outermost window we are allowed to touch
  try {
    if (window.top && window.top !== window.self) {
      window.top.location.href = url;
      return true;
    }
  } catch {
    /* cross-origin top — fall through */
  }
  try {
    window.location.href = url;
    return true;
  } catch {
    return false;
  }
}
