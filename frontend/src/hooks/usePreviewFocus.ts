import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * When the storefront is loaded inside an admin preview frame
 * (`?__preview=1&focus=<section>&item=<id>`), this dims and blurs every
 * storefront section except the one the admin is editing, and scrolls it
 * into view. Purely visual — nothing is stored, styles are identical to the
 * live site, and normal visits are untouched.
 */
export function usePreviewFocus() {
  const { search } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);
    if (params.get("__preview") !== "1") return;
    const focus = params.get("focus") ?? "all";
    const item = params.get("item");

    document.documentElement.classList.add("in-preview");
    const style = document.createElement("style");
    style.dataset.preview = "focus";

    const ease = "cubic-bezier(.22,1,.36,1)";
    const rules: string[] = [
      `[data-preview]{transition:filter .3s ${ease},opacity .3s ${ease}}`,
    ];
    if (focus !== "all") {
      rules.push(`[data-preview]{filter:blur(5px) saturate(.7);opacity:.35;pointer-events:none}`);
      rules.push(`[data-preview="${focus}"]{filter:none;opacity:1;pointer-events:auto}`);
      rules.push(
        `[data-preview="${focus}"]{outline:2px solid hsl(var(--accent));outline-offset:6px;border-radius:1.25rem}`,
      );
      if (item) {
        // Inside the focused section, sharpen only the exact record being edited.
        rules.push(`[data-preview="${focus}"] [data-preview-item]{transition:filter .3s ${ease},opacity .3s ${ease}}`);
        rules.push(`[data-preview="${focus}"] [data-preview-item]{filter:blur(3px);opacity:.4}`);
        rules.push(`[data-preview="${focus}"] [data-preview-item="${item}"]{filter:none;opacity:1}`);
      }
    }
    style.textContent = rules.join("\n");
    document.head.appendChild(style);

    // Data loads async (react-query) and sections mount late, so keep trying to
    // reach the exact record until it exists, and re-centre if the DOM changes.
    const selector = item ? `[data-preview-item="${item}"]` : `[data-preview="${focus}"]`;
    let settled = false;
    let tries = 0;
    let timer = 0 as unknown as ReturnType<typeof setTimeout>;

    const scroll = () => {
      const el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: settled ? "smooth" : "auto", block: "center" });
        settled = true;
        return;
      }
      if (tries++ < 40) timer = setTimeout(scroll, 200);
    };
    timer = setTimeout(scroll, 250);

    const mo = new MutationObserver(() => {
      if (settled) return;
      const el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: "auto", block: "center" });
        settled = true;
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      mo.disconnect();
      style.remove();
      document.documentElement.classList.remove("in-preview");
    };
  }, [search]);
}
