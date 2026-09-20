import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/astra_ecommerce";

const INITIAL_PRODUCTS = [
  {
    title: "Astra Jordan Air Rev",
    slug: "astra-jordan-air-rev",
    description: "Crossing hardwood comfort with off-court flair. '80s-inspired aerospace construction, bold kinetic details and nothin'-but-net style.",
    price: 69.99,
    originalPrice: 120.0,
    category: "footwear",
    gender: "unisex",
    sizes: ["US 7", "US 8", "US 9", "US 10", "US 11", "EU 38", "EU 40", "EU 42", "EU 44"],
    colors: ["Black and White", "Obsidian / Violet", "Pure Titanium"],
    images: [
      "https://cdn.21st.dev/assets/mirror/b5/b53e247c16c9009c0c84b479f179878b30db90aa2b6c483b5317f9c3cc185ba1.png",
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80",
    ],
    featuredImage: "https://cdn.21st.dev/assets/mirror/b5/b53e247c16c9009c0c84b479f179878b30db90aa2b6c483b5317f9c3cc185ba1.png",
    isFeatured: true,
    isNewDrop: true,
    inStock: true,
    stockCount: 28,
    rating: 4.9,
    reviewsCount: 142,
    tags: ["Sneakers", "Bestseller", "Kinetic Sole"],
  },
  {
    title: "Astra Matrix Cyber Runner",
    slug: "astra-matrix-cyber-runner",
    description: "Ultralight carbon-fiber reinforced athletic silhouette engineered for high-velocity metropolitan movement with dual-density foam dampening.",
    price: 189.0,
    originalPrice: 240.0,
    category: "footwear",
    gender: "unisex",
    sizes: ["US 8", "US 9", "US 10", "US 11", "EU 41", "EU 42", "EU 43"],
    colors: ["Cyber Silver", "Stealth Black", "Neon Violet"],
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=80",
    ],
    featuredImage: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=80",
    isFeatured: true,
    isNewDrop: true,
    inStock: true,
    stockCount: 15,
    rating: 5.0,
    reviewsCount: 88,
    tags: ["Carbon Fiber", "Running", "Limited"],
  },
  {
    title: "Astra Heavyweight Raw Silk Hoodie",
    slug: "astra-heavyweight-raw-silk-hoodie",
    description: "520 GSM custom milled heavyweight organic cotton infused with raw silk threads. Oversized boxy silhouette with dropped shoulders and concealed seam pockets.",
    price: 145.0,
    originalPrice: 195.0,
    category: "apparel",
    gender: "unisex",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Obsidian Onyx", "Slate Grey", "Violet Mist"],
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
    ],
    featuredImage: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
    isFeatured: true,
    isNewDrop: true,
    inStock: true,
    stockCount: 42,
    rating: 4.8,
    reviewsCount: 96,
    tags: ["Heavyweight", "Apparel", "Organic Cotton"],
  },
];

async function runSeed() {
  try {
    console.log("Connecting to MongoDB:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully!");

    const ProductSchema = new mongoose.Schema({}, { strict: false });
    const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

    await Product.deleteMany({});
    console.log("Cleared existing products.");

    const inserted = await Product.insertMany(INITIAL_PRODUCTS);
    console.log(`Successfully seeded ${inserted.length} Astra products!`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

runSeed();
