import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { isVideoUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

type Props = {
  src?: string | null;
  /** Optional dedicated video that should take priority over the image. */
  videoSrc?: string | null;
  poster?: string | null;
  alt?: string;
  className?: string;
  /** Aspect ratio wrapper, e.g. "aspect-[4/5]". */
  ratio?: string;
  rounded?: string;
  fallbackLabel?: string;
  loop?: boolean;
  /** Show a poster + play button instead of autoplaying the video. */
  thumbnail?: boolean;
  /** Autoplay video muted when scrolled into viewport */
  autoPlayOnScroll?: boolean;
};

/**
 * Renders a video when a video URL is supplied, otherwise an image, otherwise a
 * branded placeholder — always in the same box so layouts never shift.
 */
export function SmartMedia({
  src,
  videoSrc,
  poster,
  alt = "",
  className,
  ratio = "aspect-[4/5]",
  rounded = "rounded-2xl",
  fallbackLabel = "PRIORA",
  loop = true,
  thumbnail = false,
  autoPlayOnScroll = true,
}: Props) {
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  const [activated, setActivated] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const video = videoSrc || (isVideoUrl(src) ? src : null);
  const image = !isVideoUrl(src) ? src : null;
  const posterSrc = poster || image || undefined;

  /**
   * Films autoplay or load once they scroll into view.
   * Keeps video-heavy pages fast on mobile while autoplaying smoothly when visible.
   */
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      if (autoPlayOnScroll) {
        setActivated(true);
        setPlaying(true);
      }
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (autoPlayOnScroll) {
              setActivated(true);
              setPlaying(true);
              videoRef.current?.play().catch(() => {});
            }
          } else {
            if (autoPlayOnScroll && videoRef.current && !videoRef.current.paused) {
              videoRef.current.pause();
              setPlaying(false);
            }
          }
        });
      },
      { threshold: 0.25, rootMargin: "50px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [autoPlayOnScroll]);

  function toggle() {
    if (!activated) {
      setActivated(true);
      setPlaying(true);
      // The element mounts with autoPlay on this pass.
      return;
    }
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  const mountVideo = !!video && !failed && visible && (!thumbnail || activated || autoPlayOnScroll);

  return (
    <div
      ref={boxRef}
      className={cn("relative w-full overflow-hidden bg-champagne/30", ratio, rounded, className)}
    >
      {video && !failed ? (
        <>
          {mountVideo ? (
            <video
              ref={videoRef}
              src={video}
              poster={posterSrc}
              title={alt || fallbackLabel || "Video presentation"}
              aria-label={alt || fallbackLabel || "Video presentation"}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              playsInline
              autoPlay
              loop={loop}
              preload="metadata"
              onEnded={() => setPlaying(false)}
              onError={() => setFailed(true)}
            />
          ) : posterSrc ? (
            <img
              src={posterSrc}
              alt={alt}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-champagne/60 via-background to-champagne/30" />
          )}

          {thumbnail && (
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pause video" : "Play video"}
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-opacity",
                playing ? "opacity-0 hover:opacity-100" : "opacity-100",
              )}
            >
              <span className="absolute inset-0 bg-gradient-to-t from-espresso/45 via-transparent to-transparent" />
              <span className="relative w-12 h-12 rounded-full bg-alabaster/90 backdrop-blur flex items-center justify-center text-terracotta shadow-lg">
                {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
              </span>
            </button>
          )}
        </>
      ) : image && !failed ? (
        <img
          src={image}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-champagne/60 via-background to-champagne/30">
          <span className="font-serif tracking-[0.35em] text-xs text-terracotta/70">{fallbackLabel}</span>
        </div>
      )}
    </div>
  );
}
