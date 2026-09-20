import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { INITIAL_PRODUCTS } from "@/lib/products-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");
    const featured = searchParams.get("featured");

    const conn = await connectToDatabase();

    if (conn) {
      const query: any = {};
      if (category && category !== "all") {
        query.category = category;
      }
      if (featured === "true") {
        query.isFeatured = true;
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(search, "i")] } },
        ];
      }

      let sortOption: any = { createdAt: -1 };
      if (sort === "price-low") sortOption = { price: 1 };
      if (sort === "price-high") sortOption = { price: -1 };
      if (sort === "rating") sortOption = { rating: -1 };

      const dbProducts = await Product.find(query).sort(sortOption).lean();

      if (dbProducts && dbProducts.length > 0) {
        return NextResponse.json({ success: true, count: dbProducts.length, data: dbProducts });
      }
    }

    // Fallback in-memory dataset
    let filtered = [...INITIAL_PRODUCTS];

    if (category && category !== "all") {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (featured === "true") {
      filtered = filtered.filter((p) => p.isFeatured);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sort === "price-low") filtered.sort((a, b) => a.price - b.price);
    if (sort === "price-high") filtered.sort((a, b) => b.price - a.price);
    if (sort === "rating") filtered.sort((a, b) => b.rating - a.rating);

    return NextResponse.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error: any) {
    console.error("Products GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const conn = await connectToDatabase();

    if (!body.title || !body.price || !body.category) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const slug =
      body.slug ||
      body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    if (conn) {
      const newProduct = await Product.create({ ...body, slug });
      return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
    }

    // In-memory response
    const mockProduct = {
      id: `astra-${Date.now()}`,
      ...body,
      slug,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: mockProduct }, { status: 201 });
  } catch (error: any) {
    console.error("Products POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
