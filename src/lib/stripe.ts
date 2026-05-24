import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

export const PLANS: Array<{
  name: string;
  credits: number;
  price: number;
  priceId: string;
  description: string;
  features: string[];
  popular?: boolean;
}> = [
  {
    name: "Starter",
    credits: 100,
    price: 2999,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    description: "100 credits/month",
    features: ["100 pages/month", "All book types", "KDP-ready PDFs", "Email support"],
  },
  {
    name: "Pro",
    credits: 400,
    price: 5999,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    description: "400 credits/month",
    features: ["400 pages/month", "All book types", "KDP-ready PDFs", "Priority support", "Bulk generation"],
    popular: true,
  },
];

export const TOPUP_PACKS = [
  {
    name: "50 Credits",
    credits: 50,
    price: 999,
    priceId: process.env.STRIPE_TOPUP_50_PRICE_ID!,
  },
] as const;

export function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}
