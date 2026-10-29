import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/store-data";

function generateOrderReference(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomStr = "";
  for (let i = 0; i < 5; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RF-${yy}${mm}${dd}-${randomStr}`;
}

export async function POST(request: NextRequest) {
  if (process.env.MOCK_PAYMENTS !== "true") {
    return NextResponse.json(
      { error: "Mock payments are disabled." },
      { status: 501 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const { customer, items, shippingMethod, paymentMethod, displayedTotal } =
    (body && typeof body === "object" ? body : {}) as {
      customer?: {
        fullName?: string;
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
        state?: string;
      };
      items?: Array<{
        id?: string;
        productId?: string;
        quantity?: number;
      }>;
      shippingMethod?: string;
      paymentMethod?: string;
      displayedTotal?: number;
    };

  if (
    !customer ||
    typeof customer.fullName !== "string" || !customer.fullName.trim() ||
    typeof customer.email !== "string" || !customer.email.trim() ||
    typeof customer.phone !== "string" || !customer.phone.trim() ||
    typeof customer.address !== "string" || !customer.address.trim() ||
    typeof customer.city !== "string" || !customer.city.trim() ||
    typeof customer.state !== "string" || !customer.state.trim()
  ) {
    return NextResponse.json(
      { error: "Missing or invalid required customer details." },
      { status: 400 }
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "Shopping bag items must not be empty." },
      { status: 400 }
    );
  }

  if (paymentMethod !== "card" && paymentMethod !== "transfer") {
    return NextResponse.json(
      { error: "Payment method must be 'card' or 'transfer'." },
      { status: 400 }
    );
  }

  let serverSubtotal = 0;
  for (const item of items) {
    const productId = item.productId || item.id;
    const product = products.find((p) => p.id === productId);
    if (!product) {
      return NextResponse.json(
        { error: "One or more items in your bag are invalid." },
        { status: 400 }
      );
    }
    const quantity = typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : 1;
    serverSubtotal += product.price * quantity;
  }

  const shippingCost = shippingMethod === "priority" ? 6500 : 3500;
  const serverTotal = serverSubtotal + shippingCost;

  if (serverTotal !== displayedTotal) {
    return NextResponse.json(
      { error: "Prices have changed. Please review your bag." },
      { status: 409 }
    );
  }

  const orderRef = generateOrderReference();
  const origin = request.nextUrl.origin;
  const checkoutUrl = `${origin}/checkout/success?ref=${orderRef}`;

  return NextResponse.json({ checkoutUrl }, { status: 200 });
}
