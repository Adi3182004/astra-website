import { useEffect } from "react";

/**
 * Palmonas-style tab attention: when the user switches away, the document
 * title alternates between two teaser messages; restores on return.
 */
export function useTabTitleAttention(messages: string[] = ["💗 You left this...", "💗 Come back!"]) {
  const key = messages.join("|");
  useEffect(() => {
    const list = key.split("|");
    const original = document.title;
    let timer: number | undefined;
    let i = 0;

    const startTeasing = () => {
      document.title = list[0];
      timer = window.setInterval(() => {
        i = (i + 1) % list.length;
        document.title = list[i];
      }, 2000);
    };

    const stopTeasing = () => {
      if (timer) window.clearInterval(timer);
      timer = undefined;
      i = 0;
      document.title = original;
    };

    const onVisibility = () => {
      if (document.hidden) startTeasing();
      else stopTeasing();
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (timer) window.clearInterval(timer);
      document.title = original;
    };
  }, [key]);
}
