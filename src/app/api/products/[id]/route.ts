import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { INITIAL_PRODUCTS } from "@/lib/products-data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conn = await connectToDatabase();

    if (conn) {
      const product = await Product.findOne({
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { slug: id }, { id: id }],
      }).lean();

      if (product) {
        return NextResponse.json({ success: true, data: product });
      }
    }

    // In-memory lookup
    const fallback = INITIAL_PRODUCTS.find((p) => p.id === id || p.slug === id);

    if (fallback) {
      return NextResponse.json({ success: true, data: fallback });
    }

    return NextResponse.json(
      { success: false, error: "Product not found" },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error fetching product" },
      { status: 500 }
    );
  }
}
