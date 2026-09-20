import { supabase } from "@/integrations/supabase/client";

// Import local fallback image assets
import braceletCherry from "@/assets/bracelet-cherry.png";
import braceletStars from "@/assets/bracelet-stars.png";
import braceletEvileye from "@/assets/bracelet-evileye.png";
import braceletButterfly from "@/assets/bracelet-butterfly.png";
import braceletRainbow from "@/assets/bracelet-rainbow.png";
import necklaceCrown from "@/assets/necklace-crown.png";
import necklaceBow from "@/assets/necklace-bow.png";
import necklaceFairy from "@/assets/necklace-fairy.png";
import necklaceTravel from "@/assets/necklace-travel.png";
import necklaceHeart from "@/assets/necklace-heart.png";
import earringElephants from "@/assets/earring-elephants.png";
import earringBows from "@/assets/earring-bows.png";
import earringHearts from "@/assets/earring-hearts.png";
import earringRoses from "@/assets/earring-roses.png";

export interface RecommendationItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  discountPct: number;
  image: string;
  category?: string;
  isActive?: boolean;
}

export interface RecommendationConfig {
  isRandom: boolean; // if true, randomly select recommendations from pool; if false, use curated list
  title: string;
  maxDisplayCount: number;
  customItems: RecommendationItem[];
  // Mapping of Parent Product ID -> Array of Recommended Product IDs
  productRules?: Record<string, string[]>;
}

export const DEFAULT_RECOMMENDED_ITEMS: RecommendationItem[] = [
  {
    id: "rec-cherry-bracelet",
    name: "Cherry Blossom Charm Bracelet",
    slug: "cherry-blossom-charm-bracelet",
    price: 666,
    originalPrice: 3699,
    discountPct: 82,
    image: braceletCherry,
    category: "Bracelets",
    isActive: true,
  },
  {
    id: "rec-stars-bracelet",
    name: "Glimmer Star Constellation Bracelet",
    slug: "glimmer-star-constellation-bracelet",
    price: 555,
    originalPrice: 2899,
    discountPct: 81,
    image: braceletStars,
    category: "Bracelets",
    isActive: true,
  },
  {
    id: "rec-evileye-bracelet",
    name: "Evil Eye Protection Amulet Bracelet",
    slug: "evil-eye-protection-amulet-bracelet",
    price: 599,
    originalPrice: 2999,
    discountPct: 80,
    image: braceletEvileye,
    category: "Bracelets",
    isActive: true,
  },
  {
    id: "rec-crown-necklace",
    name: "Royal Crown Solitaire Pendant",
    slug: "royal-crown-solitaire-pendant",
    price: 799,
    originalPrice: 3999,
    discountPct: 80,
    image: necklaceCrown,
    category: "Necklaces",
    isActive: true,
  },
  {
    id: "rec-bow-necklace",
    name: "Coquette Bow Ribbon Necklace",
    slug: "coquette-bow-ribbon-necklace",
    price: 649,
    originalPrice: 3299,
    discountPct: 80,
    image: necklaceBow,
    category: "Necklaces",
    isActive: true,
  },
  {
    id: "rec-fairy-necklace",
    name: "Fairy Forest Blossom Necklace",
    slug: "fairy-forest-blossom-necklace",
    price: 699,
    originalPrice: 3599,
    discountPct: 81,
    image: necklaceFairy,
    category: "Necklaces",
    isActive: true,
  },
  {
    id: "rec-butterfly-bracelet",
    name: "Golden Butterfly Sparkle Bracelet",
    slug: "golden-butterfly-sparkle-bracelet",
    price: 649,
    originalPrice: 3299,
    discountPct: 80,
    image: braceletButterfly,
    category: "Bracelets",
    isActive: true,
  },
  {
    id: "rec-rainbow-bracelet",
    name: "Rainbow Prism Zirconia Tennis Bracelet",
    slug: "rainbow-prism-zirconia-tennis-bracelet",
    price: 799,
    originalPrice: 3999,
    discountPct: 80,
    image: braceletRainbow,
    category: "Bracelets",
    isActive: true,
  },
  {
    id: "rec-travel-necklace",
    name: "Wanderlust Aeroplane & Globe Pendant",
    slug: "wanderlust-aeroplane-globe-pendant",
    price: 749,
    originalPrice: 3499,
    discountPct: 79,
    image: necklaceTravel,
    category: "Necklaces",
    isActive: true,
  },
  {
    id: "rec-heart-necklace",
    name: "Amore Cubic Zirconia Heart Locket",
    slug: "amore-cubic-zirconia-heart-locket",
    price: 699,
    originalPrice: 3199,
    discountPct: 78,
    image: necklaceHeart,
    category: "Necklaces",
    isActive: true,
  },
  {
    id: "rec-elephants-earring",
    name: "Sacred Elephant Good Luck Studs",
    slug: "sacred-elephant-good-luck-studs",
    price: 499,
    originalPrice: 2499,
    discountPct: 80,
    image: earringElephants,
    category: "Earrings",
    isActive: true,
  },
  {
    id: "rec-bows-earring",
    name: "Petite Ribbon Bow Drop Earrings",
    slug: "petite-ribbon-bow-drop-earrings",
    price: 499,
    originalPrice: 2499,
    discountPct: 80,
    image: earringBows,
    category: "Earrings",
    isActive: true,
  },
  {
    id: "rec-hearts-earring",
    name: "Sparkling Twin Heart Stud Earrings",
    slug: "sparkling-twin-heart-stud-earrings",
    price: 499,
    originalPrice: 2499,
    discountPct: 80,
    image: earringHearts,
    category: "Earrings",
    isActive: true,
  },
  {
    id: "rec-roses-earring",
    name: "Vintage Blooming Rose Gold Studs",
    slug: "vintage-blooming-rose-gold-studs",
    price: 549,
    originalPrice: 2699,
    discountPct: 80,
    image: earringRoses,
    category: "Earrings",
    isActive: true,
  },
];

export const DEFAULT_RECOMMENDATION_CONFIG: RecommendationConfig = {
  isRandom: true,
  title: "Recommended For You",
  maxDisplayCount: 4,
  customItems: DEFAULT_RECOMMENDED_ITEMS,
  productRules: {},
};

export async function fetchRecommendationConfig(): Promise<RecommendationConfig> {
  try {
    const { data } = await supabase.from("site_settings").select("theme").eq("id", 1).single();
    const theme = (data?.theme as any) || {};
    const recConfig = theme.recommendations as Partial<RecommendationConfig> | undefined;

    if (recConfig) {
      return {
        isRandom: recConfig.isRandom ?? true,
        title: recConfig.title || "Recommended For You",
        maxDisplayCount: recConfig.maxDisplayCount || 4,
        productRules: recConfig.productRules || {},
        customItems:
          Array.isArray(recConfig.customItems) && recConfig.customItems.length > 0
            ? recConfig.customItems.map((item) => {
                const matchingDefault = DEFAULT_RECOMMENDED_ITEMS.find((d) => d.id === item.id);
                return {
                  ...item,
                  image: item.image || matchingDefault?.image || braceletCherry,
                };
              })
            : DEFAULT_RECOMMENDED_ITEMS,
      };
    }
    return DEFAULT_RECOMMENDATION_CONFIG;
  } catch {
    return DEFAULT_RECOMMENDATION_CONFIG;
  }
}

export async function saveRecommendationConfig(config: RecommendationConfig): Promise<boolean> {
  try {
    const { data } = await supabase.from("site_settings").select("theme").eq("id", 1).single();
    const currentTheme = (data?.theme as any) || {};
    const updatedTheme = {
      ...currentTheme,
      recommendations: config,
    };

    const { error } = await supabase
      .from("site_settings")
      .update({ theme: updatedTheme as any })
      .eq("id", 1);

    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Failed to save recommendations config:", e);
    return false;
  }
}

/**
 * Returns the array of recommended items for cart based on current config and optional cart product IDs.
 */
export function getCartRecommendations(
  config: RecommendationConfig,
  cartProductIds: string[] = []
): RecommendationItem[] {
  const activeItems = (config.customItems || DEFAULT_RECOMMENDED_ITEMS).filter((i) => i.isActive !== false);
  const count = config.maxDisplayCount || 4;

  // 1. Check if any item in the cart has product-specific recommendation rules
  if (cartProductIds.length > 0 && config.productRules) {
    const matchedRuleIds = new Set<string>();
    for (const pid of cartProductIds) {
      const assigned = config.productRules[pid];
      if (Array.isArray(assigned)) {
        assigned.forEach((id) => matchedRuleIds.add(id));
      }
    }

    if (matchedRuleIds.size > 0) {
      const specificRecommendations = activeItems.filter(
        (item) => matchedRuleIds.has(item.id) && !cartProductIds.includes(item.id)
      );

      if (specificRecommendations.length > 0) {
        if (config.isRandom) {
          const shuffled = [...specificRecommendations].sort(() => 0.5 - Math.random());
          return shuffled.slice(0, count);
        }
        return specificRecommendations.slice(0, count);
      }
    }
  }

  // 2. Fallback to global active items (excluding items already in cart)
  const candidateItems = activeItems.filter((i) => !cartProductIds.includes(i.id));
  const pool = candidateItems.length > 0 ? candidateItems : activeItems;

  if (config.isRandom) {
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  return pool.slice(0, count);
}
