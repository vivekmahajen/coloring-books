import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

const CREDIT_MAP: Record<string, number> = {
  [process.env.STRIPE_STARTER_PRICE_ID!]: 100,
  [process.env.STRIPE_PRO_PRICE_ID!]: 400,
  [process.env.STRIPE_TOPUP_50_PRICE_ID!]: 50,
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    if (!userId) return NextResponse.json({ ok: true });

    // Determine credits from line items
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    let creditsToAdd = 0;
    for (const item of lineItems.data) {
      const priceId = item.price?.id;
      if (priceId && CREDIT_MAP[priceId]) {
        creditsToAdd += CREDIT_MAP[priceId] * (item.quantity ?? 1);
      }
    }

    if (creditsToAdd > 0) {
      await db.$transaction([
        db.user.update({ where: { id: userId }, data: { credits: { increment: creditsToAdd } } }),
        db.transaction.create({
          data: {
            userId,
            creditsDelta: creditsToAdd,
            type: "PURCHASE",
            stripePaymentId: session.payment_intent as string,
            description: `Purchased ${creditsToAdd} credits`,
          },
        }),
      ]);
    }
  }

  // Handle subscription renewals
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    if (invoice.billing_reason !== "subscription_cycle") return NextResponse.json({ ok: true });

    const customer = await stripe.customers.retrieve(invoice.customer as string);
    if (customer.deleted) return NextResponse.json({ ok: true });

    const user = await db.user.findUnique({
      where: { stripeCustomerId: invoice.customer as string },
    });
    if (!user) return NextResponse.json({ ok: true });

    const lines = invoice.lines.data;
    let creditsToAdd = 0;
    for (const line of lines) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const priceId = (line as any).price?.id ?? line.pricing?.price_details?.price;
      if (priceId && CREDIT_MAP[priceId]) {
        creditsToAdd += CREDIT_MAP[priceId];
      }
    }

    if (creditsToAdd > 0) {
      await db.$transaction([
        db.user.update({ where: { id: user.id }, data: { credits: { increment: creditsToAdd } } }),
        db.transaction.create({
          data: {
            userId: user.id,
            creditsDelta: creditsToAdd,
            type: "PURCHASE",
            description: `Monthly renewal: ${creditsToAdd} credits`,
          },
        }),
      ]);
    }
  }

  return NextResponse.json({ ok: true });
}
