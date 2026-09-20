import { useEffect, useState } from "react";
import { useSiteSettings } from "@/lib/settings";
import { applyTheme, mergeTheme } from "@/lib/theme";

const PREVIEW_KEY = "priora-theme-preview";
const isPreview = () => {
  if (typeof window === "undefined") return false;
  const p = new URLSearchParams(window.location.search);
  return p.has("preview") || p.has("__preview");
};

/**
 * Applies the admin-configured theme to :root. Because site settings are
 * synced live over realtime, colour/font changes appear instantly in
 * every open tab without a reload. In `?preview=1` mode it instead renders
 * the admin's unsaved draft from localStorage.
 */
export function ThemeProvider({ children }: { children?: React.ReactNode }) {
  const { data } = useSiteSettings();
  const [draft, setDraft] = useState<unknown>(null);

  useEffect(() => {
    if (!isPreview()) return;
    const read = () => {
      try { setDraft(JSON.parse(localStorage.getItem(PREVIEW_KEY) ?? "null")); } catch { /* ignore */ }
    };
    read();
    window.addEventListener("storage", read);
    const t = setInterval(read, 800);
    return () => { window.removeEventListener("storage", read); clearInterval(t); };
  }, []);

  useEffect(() => {
    applyTheme(mergeTheme(isPreview() && draft ? draft : (data as any)?.theme));
  }, [data, draft]);

  return <>{children}</>;
}
