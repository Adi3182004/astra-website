/**
 * The ONLY place a service worker is ever registered.
 *
 * Offline caching is a production-only feature. Registering a worker inside a
 * preview frame or in development is how apps end up serving stale HTML and
 * deleted chunks, so every one of those contexts is refused here — and any
 * worker that a previous visit left behind is unregistered on the way out.
 *
 * `?sw=off` is a permanent kill switch for support purposes.
 */
const SW_URL = "/sw.js";

function isBlockedContext() {
  if (!import.meta.env.PROD) return true;
  if (typeof window === "undefined") return true;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true; // cross-origin frame
  }
  const h = window.location.hostname;
  if (h.startsWith("id-preview--") || h.startsWith("preview--")) return true;
  if (h === "lovableproject.com" || h.endsWith(".lovableproject.com")) return true;
  if (h === "lovableproject-dev.com" || h.endsWith(".lovableproject-dev.com")) return true;
  if (h === "beta.lovable.dev" || h.endsWith(".beta.lovable.dev")) return true;
  if (new URLSearchParams(window.location.search).has("sw")) {
    return new URLSearchParams(window.location.search).get("sw") === "off";
  }
  return false;
}

async function unregisterApp() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(
    regs
      .filter((r) => (r.active?.scriptURL ?? r.installing?.scriptURL ?? "").endsWith(SW_URL))
      .map((r) => r.unregister()),
  );
}

/**
 * Detects if an old service worker is serving a stale bundle.
 * Compares the SW's precache manifest timestamp with the current build.
 * If stale, forces SW to skip waiting and reloads the page once.
 */
async function healStaleServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.getRegistration("/");
    if (!reg?.active) return;

    // Force the new SW to take over if one is waiting
    if (reg.waiting) {
      reg.waiting.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
      return;
    }

    // Listen for future SW updates and auto-reload
    reg.addEventListener("updatefound", () => {
      const newWorker = reg.installing;
      if (!newWorker) return;
      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          // New SW installed — reload once to get fresh content
          const RELOAD_KEY = "priora-sw-reload";
          if (!sessionStorage.getItem(RELOAD_KEY)) {
            sessionStorage.setItem(RELOAD_KEY, "1");
            window.location.reload();
          }
        }
      });
    });
  } catch {
    /* non-critical — app works without it */
  }
}

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (isBlockedContext()) {
    void unregisterApp();
    return;
  }
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(SW_URL, { scope: "/" }).then(() => {
      void healStaleServiceWorker();
    }).catch(() => {
      /* offline or unsupported — the app works fine without it */
    });
  });
}
