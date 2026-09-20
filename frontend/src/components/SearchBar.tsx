import { Search } from "lucide-react";
import { useRotatingPlaceholder } from "@/hooks/useRotatingPlaceholder";
import { useSiteSettings } from "@/lib/settings";

const DEFAULTS = [
  "Search for earrings...",
  "Search for rings...",
  "Search for necklaces...",
  "Search for bracelets...",
];

export function SearchBar({
  value,
  onChange,
  onSubmit,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
}) {
  const { data: settings } = useSiteSettings();
  const list = settings?.search_placeholders?.length ? settings.search_placeholders : DEFAULTS;
  const placeholder = useRotatingPlaceholder(list);

  return (
    <div className="flex items-center gap-2 rounded-full bg-secondary/60 border border-border/60 px-4 py-2.5">
      <Search size={16} className="text-muted-foreground shrink-0" />
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit?.()}
        placeholder={placeholder}
        aria-label="Search products"
        className="flex-1 bg-transparent text-sm outline-none min-w-0 placeholder:transition-opacity"
      />
    </div>
  );
}
