import { useEffect, useState } from "react";

export function useRotatingPlaceholder(items: string[], interval = 2600) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % items.length), interval);
    return () => clearInterval(t);
  }, [items.length, interval]);
  return items[i] ?? "";
}
