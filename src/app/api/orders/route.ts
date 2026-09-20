import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";

export async function GET() {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const orders = await Order.find().sort({ createdAt: -1 }).lean();
      return NextResponse.json({ success: true, count: orders.length, data: orders });
    }
    return NextResponse.json({ success: true, count: 0, data: [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, items, subtotal, shipping = 0, discount = 0, total, paymentMethod = "demo-instant" } = body;

    if (!customer || !items || !items.length || !total) {
      return NextResponse.json(
        { success: false, error: "Missing required order information" },
        { status: 400 }
      );
    }

    const orderNumber = `ASTRA-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const orderPayload = {
      orderNumber,
      customer,
      items,
      subtotal,
      shipping,
      discount,
      total,
      paymentMethod,
      paymentStatus: "paid",
      orderStatus: "confirmed",
      createdAt: new Date(),
    };

    const conn = await connectToDatabase();
    if (conn) {
      const createdOrder = await Order.create(orderPayload);
      return NextResponse.json({ success: true, data: createdOrder }, { status: 201 });
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: `ord_${Date.now()}`,
        ...orderPayload,
      },
      message: "Order placed successfully (Instant Demo Confirmation)",
    }, { status: 201 });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
