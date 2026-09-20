import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRef } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { usePreviewDraft } from "@/lib/previewDraft";

import { T } from "@/components/SlotText";
import { styleToCss, type StyleMap } from "@/lib/textStyles";

export function ReviewsSection() {
  const scroller = useRef<HTMLDivElement>(null);

  const mergeReviews = usePreviewDraft("reviews");
  const { data: reviewsRaw } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*, products(name,slug,product_images(url,sort_order))")
        .eq("is_active", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  const reviews = mergeReviews(reviewsRaw as any[]);

  if (!reviews.length) return null;

  const scroll = (dir: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section className="px-4 py-10 md:py-14 bg-champagne/30 border-y border-border/50">
      <T k="home.reviews.title" as="h2" className="font-serif italic text-3xl text-center mb-8" />
      <div className="relative max-w-6xl mx-auto">
        <ArrowBtn dir={-1} onClick={() => scroll(-1)} />
        <ArrowBtn dir={1} onClick={() => scroll(1)} />
        <div
          ref={scroller}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-1"
        >
          {reviews.map((r: any) => {
            const img =
              (r.products?.product_images ?? [])
                .slice()
                .sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.url ?? r.image_url;
            const textStyle = (r.text_style ?? {}) as StyleMap;
            return (
              <article
                key={r.id}
                data-preview-item={r.id}
                className="snap-center shrink-0 w-[86%] sm:w-[46%] lg:w-[31%] flex flex-col items-center text-center rounded-2xl bg-background/70 backdrop-blur p-5"
              >
                <div className="flex gap-1 text-terracotta mb-2">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-current" />
                  ))}
                </div>
                <p className="text-sm font-medium mb-2" style={styleToCss(textStyle.author)}>{r.author}</p>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1" style={styleToCss(textStyle.body)}>{r.body}</p>
                {r.products && (
                  <Link
                    to={`/product/${r.products.slug}`}
                    className="mt-4 w-full flex items-center gap-3 bg-secondary/50 rounded-xl p-2 text-left"
                  >
                    {img && <img src={img} alt="" loading="lazy" className="w-12 h-12 rounded-lg object-cover" />}
                    <span className="text-xs underline underline-offset-4">{r.products.name}</span>
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ArrowBtn({ dir, onClick }: { dir: -1 | 1; onClick: () => void }) {
  const Icon = dir === -1 ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      aria-label={dir === -1 ? "Previous reviews" : "Next reviews"}
      className={`absolute top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center
        bg-champagne text-espresso border border-border/60 shadow-md transition-colors
        hover:bg-espresso hover:text-champagne ${dir === -1 ? "-left-1 md:-left-4" : "-right-1 md:-right-4"}`}
    >
      <Icon size={18} />
    </button>
  );
}
