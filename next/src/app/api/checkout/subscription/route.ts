import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const MAX_AMOUNT = 100000; // 月額10万円上限

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-12-15.clover",
  });
}

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json();

    if (!amount || typeof amount !== "number" || amount < 100 || amount > MAX_AMOUNT) {
      return NextResponse.json(
        { error: `100円以上${MAX_AMOUNT.toLocaleString()}円以下を指定してください` },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: {
              name: "MLB Fanatic - 月額サブスクリプション",
              description: `月額¥${amount.toLocaleString()}のサブスクリプション`,
            },
            unit_amount: amount,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json(
      { error: "サブスクリプションセッションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
