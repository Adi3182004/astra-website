import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SmartMedia } from "@/components/media/SmartMedia";
import { usePreviewDraft } from "@/lib/previewDraft";
import { T } from "@/components/SlotText";
import { styleToCss, type StyleMap } from "@/lib/textStyles";

export function VideoSection() {
  const mergeVideos = usePreviewDraft("site_videos");
  const { data: videosRaw } = useQuery({
    queryKey: ["site_videos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_videos")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  const videos = mergeVideos(videosRaw as any[]);

  if (!videos.length) return null;

  // If in preview with a specific item requested, prioritize it, otherwise first active in sequence
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const targetItemId = searchParams?.get("item");
  const v: any = (targetItemId && videos.find((item: any) => item.id === targetItemId)) || videos[0];

  const textStyle = (v.text_style ?? {}) as StyleMap;

  return (
    <section className="px-4 py-8 md:py-12 max-w-3xl mx-auto">
      <T k="home.videos.title" as="h2" className="font-serif text-2xl md:text-3xl mb-5 text-center" />
      <div
        key={v.id}
        data-preview-item={v.id}
        className="group relative rounded-2xl overflow-hidden glass-card luxury-shadow"
      >
        <SmartMedia
          videoSrc={v.video_url || "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-jeweler-crafting-a-ring-41584-large.mp4"}
          poster={v.poster_url || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800"}
          autoPlayOnScroll={true}
          ratio="aspect-[4/5] sm:aspect-video"
          rounded="rounded-2xl"
          alt={v.title ?? "The KP Chapter"}
        />
        <div className="absolute bottom-0 inset-x-0 p-4 pointer-events-none bg-gradient-to-t from-black/70 via-black/30 to-transparent">
          {v.title && (
            <p
              className="font-serif text-xl text-alabaster drop-shadow-sm"
              style={styleToCss(textStyle.title)}
            >
              {v.title}
            </p>
          )}
          {v.subtitle && (
            <p
              className="text-[10px] uppercase tracking-[0.25em] text-alabaster/90 mt-0.5 drop-shadow-sm"
              style={styleToCss(textStyle.subtitle)}
            >
              {v.subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

