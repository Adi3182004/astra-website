import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { usePreviewDraft } from "@/lib/previewDraft";
import { T } from "@/components/SlotText";
import { styleToCss, type StyleMap } from "@/lib/textStyles";

export function ForEveryYou() {
  const scroller = useRef<HTMLDivElement>(null);
  const mergeBanners = usePreviewDraft("banners");

  const { data: rawItems } = useQuery({
    queryKey: ["banners", "collection"],
    queryFn: async () => {
      const { data } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .eq("position", "collection")
        .order("sort_order");
      return data ?? [];
    },
  });

  const items = mergeBanners(rawItems as any[]).filter((b: any) => b.position === "collection");

  if (!items?.length) return null;

  const scroll = (dir: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="py-10 md:py-14">
      <T k="home.forEveryYou.title" as="h2" className="font-serif text-2xl md:text-3xl text-center mb-6 tracking-[0.15em] uppercase" />
      <div className="relative max-w-6xl mx-auto px-4">
        <Arrow dir={-1} onClick={() => scroll(-1)} />
        <Arrow dir={1} onClick={() => scroll(1)} />
        <div ref={scroller} className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
          {items.map((b: any) => {
            const textStyle = (b.text_style ?? {}) as StyleMap;
            return (
              <Link
                key={b.id}
                data-preview-item={b.id}
                to={b.cta_link ?? "/shop"}
                className="snap-center shrink-0 w-[78%] sm:w-[45%] lg:w-[32%] relative rounded-2xl overflow-hidden group"
              >
                <img
                  src={b.image_url}
                  alt={b.title ?? ""}
                  loading="lazy"
                  className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 inset-x-0 text-center px-3">
                  <p
                    className="text-alabaster font-serif text-xl tracking-[0.2em] uppercase"
                    style={styleToCss(textStyle.title)}
                  >
                    {b.title}
                  </p>
                  {b.subtitle && (
                    <p
                      className="text-alabaster/80 text-[10px] uppercase tracking-[0.3em] mt-1"
                      style={styleToCss(textStyle.subtitle)}
                    >
                      {b.subtitle}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Arrow({ dir, onClick }: { dir: -1 | 1; onClick: () => void }) {
  const Icon = dir === -1 ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      aria-label={dir === -1 ? "Previous" : "Next"}
      className={`absolute top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center
        bg-champagne text-espresso border border-border/60 shadow-md transition-colors
        hover:bg-espresso hover:text-champagne ${dir === -1 ? "left-1" : "right-1"}`}
    >
      <Icon size={18} />
    </button>
  );
}
