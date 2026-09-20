import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SmartMedia } from "@/components/media/SmartMedia";
import { usePreviewDraft } from "@/lib/previewDraft";
import { useSeo } from "@/lib/seo";

import { styleToCss, type StyleMap } from "@/lib/textStyles";

function renderContent(content: string, textStyle?: StyleMap) {
  const contentStyle = styleToCss(textStyle?.content);
  return content.split("\n").map((line, i) => {
    const t = line.trim();
    if (!t) return <div key={i} className="h-3" />;
    if (t.startsWith("## "))
      return (
        <h2 key={i} className="font-serif text-xl md:text-2xl mt-6 mb-2 text-foreground" style={contentStyle}>
          {t.slice(3)}
        </h2>
      );
    return (
      <p key={i} className="text-sm leading-relaxed text-muted-foreground" style={contentStyle}>
        {t}
      </p>
    );
  });
}

export default function InfoPage() {
  const { slug } = useParams();
  const mergePages = usePreviewDraft("info_pages");
  const { data: saved, isLoading } = useQuery({
    queryKey: ["info-page", slug],
    queryFn: async () =>
      (await supabase.from("info_pages").select("*").eq("slug", slug!).eq("is_active", true).maybeSingle()).data,
  });

  const data = mergePages(saved ? [saved as any] : [])[0] as any;
  const textStyle = (data?.text_style ?? {}) as StyleMap;

  /**
   * Info pages are indexable content (about, support, returns, policies), so
   * they carry the same full metadata set as products and categories.
   */
  const summary = (data?.content ?? "")
    .split("\n")
    .map((l: string) => l.trim())
    .filter((l: string) => l && !l.startsWith("## "))
    .join(" ")
    .slice(0, 155);

  useSeo({
    title: data?.title ? `${data.title} · PRIORA by KP` : "PRIORA by KP",
    description: summary || "Handcrafted jewellery by PRIORA by KP.",
    image: data?.hero_image_url ?? null,
    canonicalPath: `/page/${slug}`,
    type: "article",
  });

  if (isLoading) return <div className="px-6 py-16 text-center text-sm text-muted-foreground">Loading…</div>;
  if (!data)
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-muted-foreground mb-4">This page isn't available yet.</p>
        <Link to="/" className="text-accent underline text-sm">Back home</Link>
      </div>
    );

  return (
    <article data-preview="page" data-preview-item={data.id} className="max-w-2xl mx-auto px-5 py-8">
      {((data as any).hero_image_url || (data as any).hero_video_url) && (
        <SmartMedia
          src={(data as any).hero_image_url}
          videoSrc={(data as any).hero_video_url}
          alt={data.title}
          ratio="aspect-[16/9]"
          rounded="rounded-3xl"
          className="mb-6"
        />
      )}
      <h1 className="font-serif text-3xl md:text-4xl mb-6" style={styleToCss(textStyle.title)}>{data.title}</h1>
      <div className="glass-card rounded-3xl p-5 md:p-7">{renderContent(data.content, textStyle)}</div>
    </article>
  );
}
