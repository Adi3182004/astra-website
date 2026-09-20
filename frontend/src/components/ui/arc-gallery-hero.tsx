import React, { useEffect, useState } from 'react';

type ArcGalleryHeroProps = {
  images: string[];
  startAngle?: number;
  endAngle?: number;
  radiusLg?: number;
  radiusMd?: number;
  radiusSm?: number;
  cardSizeLg?: number;
  cardSizeMd?: number;
  cardSizeSm?: number;
  className?: string;
  title?: string;
  subtitle?: string;
};

export const ArcGalleryHero: React.FC<ArcGalleryHeroProps> = ({
  images,
  startAngle = 20,
  endAngle = 160,
  radiusLg = 480,
  radiusMd = 360,
  radiusSm = 260,
  cardSizeLg = 120,
  cardSizeMd = 100,
  cardSizeSm = 80,
  className = '',
  title = 'Crafted with Passion',
  subtitle = 'Each piece tells a story of elegance, artistry, and timeless beauty.',
}) => {
  const [dimensions, setDimensions] = useState({
    radius: radiusLg,
    cardSize: cardSizeLg,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDimensions({ radius: radiusSm, cardSize: cardSizeSm });
      } else if (width < 1024) {
        setDimensions({ radius: radiusMd, cardSize: cardSizeMd });
      } else {
        setDimensions({ radius: radiusLg, cardSize: cardSizeLg });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [radiusLg, radiusMd, radiusSm, cardSizeLg, cardSizeMd, cardSizeSm]);

  const count = Math.max(images.length, 2);
  const step = (endAngle - startAngle) / (count - 1);

  return (
    <section
      className={`relative w-full overflow-hidden ${className}`}
      style={{ minHeight: `${dimensions.radius + dimensions.cardSize + 200}px` }}
    >
      {/* Background ring container */}
      <div
        className="relative mx-auto"
        style={{
          width: `${dimensions.radius * 2 + dimensions.cardSize}px`,
          height: `${dimensions.radius + dimensions.cardSize}px`,
        }}
      >
        {/* Center pivot at bottom center */}
        <div
          className="absolute"
          style={{
            left: '50%',
            bottom: '0',
            transform: 'translateX(-50%)',
          }}
        >
          {images.map((src, i) => {
            const angle = startAngle + step * i;
            const angleRad = (angle * Math.PI) / 180;
            const x = Math.cos(angleRad) * dimensions.radius;
            const y = Math.sin(angleRad) * dimensions.radius;

            return (
              <div
                key={i}
                className="absolute transition-all duration-500 hover:scale-110 hover:z-10"
                style={{
                  width: `${dimensions.cardSize}px`,
                  height: `${dimensions.cardSize}px`,
                  left: `${x - dimensions.cardSize / 2}px`,
                  bottom: `${y - dimensions.cardSize / 2}px`,
                  transform: `rotate(${angle - 90}deg)`,
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div className="w-full h-full rounded-2xl overflow-hidden luxury-shadow bg-card">
                  <img
                    src={src}
                    alt={`Gallery image ${i + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content below the arc */}
      <div
        className="absolute left-1/2 -translate-x-1/2 text-center px-6 animate-fade-in"
        style={{
          bottom: '10%',
          animationDuration: '0.8s',
          animationTimingFunction: 'ease-out',
        }}
      >
        <div className="max-w-xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 leading-tight">
            {title}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base uppercase tracking-[0.15em] mb-8">
            {subtitle}
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="#collections"
              className="px-8 py-3 bg-accent text-accent-foreground rounded-full text-sm uppercase tracking-[0.15em] hover:opacity-90 transition-opacity luxury-shadow"
            >
              Explore Collection
            </a>
            <a
              href="#the-kp-chapter"
              className="px-8 py-3 border border-border rounded-full text-sm uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            >
              Our Story
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
