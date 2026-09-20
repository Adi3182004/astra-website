import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

import braceletCherry from "@/assets/bracelet-cherry.png";
import braceletButterfly from "@/assets/bracelet-butterfly.png";
import braceletEvileye from "@/assets/bracelet-evileye.png";
import braceletRainbow from "@/assets/bracelet-rainbow.png";
import braceletStars from "@/assets/bracelet-stars.png";
import earringBows from "@/assets/earring-bows.png";
import earringHearts from "@/assets/earring-hearts.png";
import earringRoses from "@/assets/earring-roses.png";
import earringPearlFlower from "@/assets/earring-pearl-flower.png";
import earringElephants from "@/assets/earring-elephants.png";
import necklaceFairy from "@/assets/necklace-fairy.png";
import necklaceTravel from "@/assets/necklace-travel.png";
import necklaceBow from "@/assets/necklace-bow.png";
import necklaceCrown from "@/assets/necklace-crown.png";
import necklaceFlower from "@/assets/necklace-flower.png";
import necklaceHeart from "@/assets/necklace-heart.png";

import { ParallaxHero } from "@/components/ui/parallax-hero";
import { StackedCards } from "@/components/ui/stacked-cards";
import { Carousel3D } from "@/components/ui/carousel-3d";
import { Lens } from "@/components/ui/lens";
import { GoldSparkles } from "@/components/GoldSparkles";
import { HorizonHeroSection } from "@/components/ui/horizon-hero-section";
import { Nav } from "@/components/Nav";
import { Wordmark } from "@/components/brand/Wordmark";
import { FadeInSection } from "@/components/FadeInSection";

const earrings = [
  { src: earringBows, title: "Sweet Bows", description: "Sculpted ribbon studs with timeless grace" },
  { src: earringHearts, title: "Melting Hearts", description: "Fluid heart silhouettes in liquid form" },
  { src: earringRoses, title: "Rose Cameos", description: "Hand-painted rose oval studs with pearl" },
  { src: earringPearlFlower, title: "Pearl Bloom", description: "Textured petal studs with lustrous pearl center" },
  { src: earringElephants, title: "Elephant Pearls", description: "Playful elephant studs with dangling pearl drops" },
];

const bracelets = [
  { src: braceletCherry, title: "Cherry Charm", description: "Playful cherry motifs on a delicate chain" },
  { src: braceletButterfly, title: "Papillon Cable", description: "Butterfly cable bangle with mother of pearl" },
  { src: braceletEvileye, title: "Guardian Eye", description: "Protective evil eye cable bracelet" },
  { src: braceletRainbow, title: "Prismatic Band", description: "Rainbow baguette tennis bracelet" },
  { src: braceletStars, title: "Starry Night", description: "Layered herringbone chain with enamel star charms" },
];

const necklaces = [
  { src: necklaceFairy, title: "Fairy Pendant", description: "Whimsical fairy silhouette with crystal" },
  { src: necklaceTravel, title: "Wanderlust Charms", description: "Travel-inspired charm cluster necklace" },
  { src: necklaceBow, title: "Ribbon Lariat", description: "Snake chain bow lariat necklace" },
  { src: necklaceCrown, title: "Crown Jewel", description: "Regal crown pendant with floating crystal" },
  { src: necklaceFlower, title: "Flower Cameo", description: "Ornate floral pendant with pearl center" },
  { src: necklaceHeart, title: "Heart Soul", description: "Mother of pearl heart on a delicate chain" },
];

const allProducts = [...earrings, ...bracelets, ...necklaces];

const Index = () => {
  const heroImages = [
    { src: earringRoses, alt: "Rose earrings", className: "top-[15%] left-[5%] md:left-[10%]", depth: 0.5, size: "w-28 h-36 md:w-40 md:h-52" },
    { src: necklaceCrown, alt: "Crown necklace", className: "top-[10%] right-[5%] md:right-[8%]", depth: 0.8, size: "w-32 h-40 md:w-44 md:h-56" },
    { src: braceletCherry, alt: "Cherry bracelet", className: "bottom-[15%] left-[8%] md:left-[15%]", depth: 0.3, size: "w-24 h-32 md:w-36 md:h-44" },
    { src: earringPearlFlower, alt: "Pearl flower earrings", className: "bottom-[20%] right-[8%] md:right-[12%]", depth: 0.6, size: "w-28 h-36 md:w-38 md:h-48" },
  ];

  

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-accent/30 overflow-x-hidden relative">
      <GoldSparkles />
      <Nav />

      {/* Hero */}
      <ParallaxHero
        images={heroImages}
        title={
          <h1 className="text-[14vw] md:text-[10vw] font-serif leading-[0.9] text-foreground">
            Pure <br />
            <span className="italic ml-[8vw]">Form</span>
          </h1>
        }
        subtitle="Hand-sculpted designs that capture the essence of light and movement"
      />

      {/* Earrings 3D Carousel */}
      <section className="py-16 md:py-24 pink-gradient-subtle">
        <Carousel3D images={earrings.map((p) => ({ src: p.src, title: p.title }))} half />
        <FadeInSection>
          <div className="px-6 md:px-10 max-w-7xl mx-auto mt-6 text-center">
            <h2 className="font-serif text-4xl md:text-5xl text-foreground">Crafted with Passion</h2>
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] mt-3 max-w-lg mx-auto">
              Each piece tells a story of elegance, artistry, and timeless beauty
            </p>
            <div className="flex items-center justify-center gap-4 mt-8">
              <a href="#collections" className="px-8 py-3 bg-accent text-accent-foreground rounded-full text-xs uppercase tracking-[0.15em] hover:opacity-90 transition-opacity">
                Explore Collection
              </a>
              <a href="#the-kp-chapter" className="px-8 py-3 border border-foreground/20 text-foreground rounded-full text-xs uppercase tracking-[0.15em] hover:bg-foreground/5 transition-colors">
                Our Story
              </a>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* Featured Collections - Stacked Cards */}
      <section id="collections" className="py-24 md:py-32 px-6 bg-rose-soft/30">
        <FadeInSection>
          <div className="max-w-7xl mx-auto text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-accent text-xs uppercase tracking-[0.2em]">Featured</span>
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Our Collections</h2>
            <p className="text-muted-foreground text-sm uppercase tracking-[0.15em]">Curated with intention — click cards to browse</p>
          </div>
        </FadeInSection>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-20 md:gap-24">
          {[
            { title: "Earrings", cards: earrings },
            { title: "Bracelets", cards: bracelets },
            { title: "Necklaces", cards: necklaces },
          ].map((collection, idx) => (
            <FadeInSection key={collection.title} delay={idx * 0.15}>
              <div className="flex flex-col items-center gap-8">
                <StackedCards cards={collection.cards.map((c) => ({ image: c.src, title: c.title, description: c.description }))} />
                <span className="font-serif text-xl text-foreground tracking-wide">{collection.title}</span>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>




      {/* Horizon Scroll Section */}
      <HorizonHeroSection />

      {/* Detail Grid with Lens */}
      <section id="the-kp-chapter" className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <FadeInSection>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-16 text-center">The KP Chapter</h2>
        </FadeInSection>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[bracelets[1], earrings[4], necklaces[5], bracelets[4]].map((item, idx) => (
            <FadeInSection key={item.title} delay={idx * 0.1}>
              <Lens zoomFactor={2}>
                <img src={item.src} alt={item.title} className="w-full aspect-[4/5] object-cover rounded-2xl" />
              </Lens>
              <div className="mt-4">
                <h3 className="font-serif text-lg text-foreground">{item.title}</h3>
                <p className="text-muted-foreground mt-1 text-xs">{item.description}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-24 md:py-32 bg-rose-soft/20">
        <div className="max-w-7xl mx-auto px-6">
          <FadeInSection>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-16 text-center">All Pieces</h2>
          </FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {allProducts.map((item, idx) => (
              <FadeInSection key={item.title} delay={(idx % 3) * 0.1}>
                <motion.div
                  className="group rounded-3xl overflow-hidden glass-card luxury-shadow"
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <div className="overflow-hidden">
                    <motion.img
                      src={item.src}
                      alt={item.title}
                      className="w-full aspect-[4/5] object-cover rounded-2xl"
                      loading="lazy"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                    />
                  </div>
                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg text-foreground">{item.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-accent hover:text-rose-deep transition-colors"
                    >
                      <Heart size={18} />
                    </motion.button>
                  </div>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 flex flex-col items-center border-t border-border/50 bg-rose-soft/10">
        <div className="mb-6 text-foreground/15">
          <Wordmark size="lg" />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Crafted for the discerning</p>
        <div className="flex gap-8 mt-8 text-xs uppercase tracking-[0.15em] text-muted-foreground">
          {["Collections", "The KP Chapter", "Bespoke", "Contact"].map((item) => (
            <a key={item} href="#" className="hover:text-foreground transition-colors duration-300">
              {item}
            </a>
          ))}
        </div>
      </footer>
    </main>
  );
};

export default Index;
