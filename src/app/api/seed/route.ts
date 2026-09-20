import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { INITIAL_PRODUCTS } from "@/lib/products-data";

export async function POST() {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({
        success: true,
        message: "MongoDB URI not configured. Seed data loaded in-memory fallback successfully.",
        count: INITIAL_PRODUCTS.length,
      });
    }

    // Upsert or clear and insert initial products
    await Product.deleteMany({});
    const inserted = await Product.insertMany(INITIAL_PRODUCTS);

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with Astra luxury clothing & footwear catalog!",
      count: inserted.length,
      data: inserted,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
