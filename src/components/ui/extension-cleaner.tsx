"use client";

import { useEffect } from "react";

export function ExtensionCleaner() {
  useEffect(() => {
    const purgeExtensions = () => {
      const selectors = [
        ".copyitall-handle",
        ".copyitall-sidebar",
        ".copyitall-backdrop",
        ".sidebar-hover-close",
        ".copyitall-popup",
        ".copyitall-btn",
        "[class*='copyitall']",
        "[id*='copyitall']",
        "[class*='copy-it-all']",
        "[id*='copy-it-all']",
        "#open-incognito-widget",
        "step1-dev-ext-ui",
        "chatgpt-sidebar",
        ".chat-gpt-query-model-wrapper",
        ".sider-popup-container",
      ];

      selectors.forEach((sel) => {
        try {
          const elements = document.querySelectorAll(sel);
          elements.forEach((el) => {
            el.remove();
          });
        } catch {}
      });

      // Also search by text content for any remaining tab containing "Copy It All"
      try {
        const allDivs = document.querySelectorAll("div, button, span, aside, section");
        allDivs.forEach((el) => {
          if (
            el.children.length <= 3 &&
            el.textContent &&
            el.textContent.trim().toLowerCase().includes("copy it all")
          ) {
            const container = (el.closest("[class*='handle']") ||
              el.closest("[class*='copy']") ||
              el) as HTMLElement;
            if (container && container.parentNode) {
              container.style.setProperty("display", "none", "important");
              container.remove();
            }
          }
        });
      } catch {}
    };

    purgeExtensions();
    const interval = setInterval(purgeExtensions, 800);

    // Also observe DOM mutations to remove instantly
    const observer = new MutationObserver(() => {
      purgeExtensions();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  return null;
}

export default ExtensionCleaner;
