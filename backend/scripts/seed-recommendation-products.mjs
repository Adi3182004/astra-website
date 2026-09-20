import { createClient } from "@supabase/supabase-js";

let supabaseUrl = "https://oriibywxhetfpcpstdyk.supabase.co";
let serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaWlieXd4aGV0ZnBjcHN0ZHlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3ODg2NCwiZXhwIjoyMTAzMTU0ODY0fQ.FmvPAosH_ulw5EDz-9CJKZo_t0T3U_fcFuw3dBpgSIs";

const sb = createClient(supabaseUrl, serviceKey);

const productsToSeed = [
  {
    name: "Cherry Blossom Charm Bracelet",
    slug: "cherry-blossom-charm-bracelet",
    description: "Playful cherry motifs on a delicate 18k gold plated chain. Handcrafted luxury for everyday elegance.",
    price: 666,
    compare_at_price: 3699,
    category_slug: "bracelets",
    category_name: "Bracelets",
    image: "https://images.unsplash.com/photo-1611591475819-79b8b730ab8c?w=800&auto=format&fit=crop&q=80",
    stock: 25,
    is_active: true,
    is_featured: true,
  },
  {
    name: "Glimmer Star Constellation Bracelet",
    slug: "glimmer-star-constellation-bracelet",
    description: "Layered herringbone chain with enamel star charms. A celestial statement piece.",
    price: 555,
    compare_at_price: 2899,
    category_slug: "bracelets",
    category_name: "Bracelets",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80",
    stock: 30,
    is_active: true,
    is_featured: true,
  },
  {
    name: "Evil Eye Protection Amulet Bracelet",
    slug: "evil-eye-protection-amulet-bracelet",
    description: "Protective evil eye cable bracelet crafted with precision and sparkling zircon crystals.",
    price: 599,
    compare_at_price: 2999,
    category_slug: "bracelets",
    category_name: "Bracelets",
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&auto=format&fit=crop&q=80",
    stock: 20,
    is_active: true,
    is_featured: true,
  },
  {
    name: "Royal Crown Solitaire Pendant",
    slug: "royal-crown-solitaire-pendant",
    description: "Regal crown pendant featuring a floating crystal center with luminous 18k gold polish.",
    price: 699,
    compare_at_price: 3499,
    category_slug: "necklaces",
    category_name: "Necklaces",
    image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&auto=format&fit=crop&q=80",
    stock: 15,
    is_active: true,
    is_featured: true,
  },
  {
    name: "Golden Bow Ribbon Lariat Necklace",
    slug: "golden-bow-ribbon-lariat-necklace",
    description: "Snake chain bow lariat necklace. Delicate, romantic, and effortlessly graceful.",
    price: 649,
    compare_at_price: 3299,
    category_slug: "necklaces",
    category_name: "Necklaces",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80",
    stock: 18,
    is_active: true,
    is_featured: true,
  },
  {
    name: "Fairy Silhouette Crystal Pendant",
    slug: "fairy-silhouette-crystal-pendant",
    description: "Whimsical fairy silhouette holding a brilliant faceted teardrop crystal.",
    price: 599,
    compare_at_price: 2999,
    category_slug: "necklaces",
    category_name: "Necklaces",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80",
    stock: 22,
    is_active: true,
    is_featured: true,
  },
  {
    name: "Elephant Pearl Drop Stud Earrings",
    slug: "elephant-pearl-drop-stud-earrings",
    description: "Playful elephant studs with dangling freshwater pearl drops. Symbol of wisdom and prosperity.",
    price: 499,
    compare_at_price: 2499,
    category_slug: "earrings",
    category_name: "Earrings",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80",
    stock: 40,
    is_active: true,
    is_featured: true,
  },
  {
    name: "Sweet Bow Ribbon Studs",
    slug: "sweet-bow-ribbon-studs",
    description: "Sculpted ribbon studs with timeless grace and hypoallergenic surgical steel posts.",
    price: 450,
    compare_at_price: 2250,
    category_slug: "earrings",
    category_name: "Earrings",
    image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800&auto=format&fit=crop&q=80",
    stock: 35,
    is_active: true,
    is_featured: true,
  },
];

async function seed() {
  console.log("Fetching categories...");
  let { data: categories } = await sb.from("categories").select("*");
  const catMap = {};

  // Ensure categories exist
  const requiredCats = [
    { name: "Bracelets", slug: "bracelets" },
    { name: "Necklaces", slug: "necklaces" },
    { name: "Earrings", slug: "earrings" },
  ];

  for (const rc of requiredCats) {
    let match = categories?.find((c) => c.slug === rc.slug);
    if (!match) {
      console.log("Creating category:", rc.name);
      const { data: newCat } = await sb.from("categories").insert({
        name: rc.name,
        slug: rc.slug,
        is_active: true,
      }).select().single();
      match = newCat;
    }
    if (match) catMap[rc.slug] = match.id;
  }

  // Insert or update products
  console.log("Seeding products...");
  for (const item of productsToSeed) {
    const catId = catMap[item.category_slug];
    const { data: existing } = await sb.from("products").select("id").eq("slug", item.slug).maybeSingle();
    let productId = existing?.id;

    if (!productId) {
      console.log("Inserting product:", item.name);
      const { data: pData, error: pErr } = await sb.from("products").insert({
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        compare_at_price: item.compare_at_price,
        category_id: catId,
        stock: item.stock,
        is_active: true,
        is_featured: item.is_featured,
      }).select().single();

      if (pErr) {
        console.error("Error inserting product:", pErr);
        continue;
      }
      productId = pData.id;
    } else {
      console.log("Updating product:", item.name);
      await sb.from("products").update({
        name: item.name,
        description: item.description,
        price: item.price,
        compare_at_price: item.compare_at_price,
        category_id: catId,
        stock: item.stock,
        is_active: true,
        is_featured: item.is_featured,
      }).eq("id", productId);
    }

    // Insert image if not present
    if (productId) {
      const { data: imgList } = await sb.from("product_images").select("id").eq("product_id", productId);
      if (!imgList || imgList.length === 0) {
        await sb.from("product_images").insert({
          product_id: productId,
          url: item.image,
          sort_order: 0,
        });
      }
    }
  }

  console.log("✅ Seeded products successfully!");
}

seed().catch(console.error);
