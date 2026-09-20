import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./registerSW";

// Self-healing: if an old cached worker tries to fetch a deleted JS chunk hash, reload to get fresh HTML
if (typeof window !== "undefined") {
  window.addEventListener("error", (e) => {
    const msg = e?.message || "";
    if (msg.includes("Failed to fetch dynamically imported module") || msg.includes("Loading chunk") || msg.includes("error loading dynamically imported module")) {
      const KEY = "priora-chunk-heal";
      if (!sessionStorage.getItem(KEY)) {
        sessionStorage.setItem(KEY, "1");
        window.location.reload();
      }
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);

registerServiceWorker();

