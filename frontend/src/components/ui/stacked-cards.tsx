import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CardData {
  image: string;
  title: string;
  description: string;
}

interface StackedCardsProps {
  cards: CardData[];
}

export const StackedCards = ({ cards }: StackedCardsProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const displayCards = cards.slice(0, 4);

  const handleClick = () => {
    // Cycle through cards like a deck — move front card to back
    setActiveIndex((prev) => (prev + 1) % displayCards.length);
  };

  // Reorder cards based on activeIndex
  const orderedCards = displayCards.map((_, i) => {
    const actualIndex = (i + activeIndex) % displayCards.length;
    return { card: displayCards[actualIndex], originalIndex: actualIndex };
  });

  return (
    <div
      className="relative w-72 h-96 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <AnimatePresence mode="popLayout">
        {orderedCards.map(({ card, originalIndex }, stackIndex) => (
          <motion.div
            key={originalIndex}
            className="absolute inset-0 rounded-3xl overflow-hidden luxury-shadow"
            layout
            animate={{
              x: isHovered ? (stackIndex === 0 ? 0 : (stackIndex - 1) * 20) : 0,
              y: isHovered ? stackIndex * -10 : stackIndex * -6,
              rotate: isHovered ? (stackIndex === 0 ? 0 : (stackIndex - 1) * 4) : (stackIndex) * 1.5,
              scale: 1 - stackIndex * 0.04,
              zIndex: displayCards.length - stackIndex,
            }}
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 22,
              mass: 0.8,
            }}
          >
            <div className="w-full h-full bg-card relative">
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-3/4 object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <h3 className="font-serif text-lg text-foreground">{card.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Click hint */}
      <motion.div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/60 uppercase tracking-widest"
        animate={{ opacity: isHovered ? 1 : 0 }}
      >
        Click to flip
      </motion.div>
    </div>
  );
};
