import Link from "next/link";
import { Check } from "lucide-react";
import { PLANS, TOPUP_PACKS, formatPrice } from "@/lib/stripe";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between bg-white">
        <Link href="/" className="font-bold text-xl text-indigo-600">BookGen AI</Link>
        <Link href="/sign-up" className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          Get started
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-xl text-gray-500">Pay per page generated. No hidden fees.</p>
          <p className="text-sm text-gray-400 mt-2">1 credit = 1 generated page</p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl border p-8 relative ${plan.popular ? "border-indigo-500 shadow-xl shadow-indigo-100" : "border-gray-200"}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                  Most popular
                </span>
              )}
              <h2 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h2>
              <p className="text-gray-500 text-sm mb-4">{plan.description}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className={`block w-full text-center py-3 rounded-xl font-semibold transition ${
                  plan.popular
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>

        {/* Top-up packs */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Need more credits?</h2>
          <p className="text-gray-500 text-sm mb-6">Top up anytime — credits never expire.</p>
          <div className="flex flex-wrap gap-4">
            {TOPUP_PACKS.map((pack) => (
              <div key={pack.name} className="border border-gray-200 rounded-xl px-6 py-4 flex items-center gap-4">
                <div>
                  <div className="font-semibold text-gray-900">{pack.name}</div>
                  <div className="text-sm text-gray-500">{formatPrice(pack.price)} one-time</div>
                </div>
                <Link href="/sign-up" className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                  Buy
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently asked questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { q: "What is a credit?", a: "1 credit = 1 generated page image. A 20-page coloring book costs 20 credits plus 1 for the cover." },
              { q: "Can I sell what I generate?", a: "Yes. Full commercial rights are included in all plans. Publish on Amazon KDP, Etsy, or anywhere." },
              { q: "Do credits roll over?", a: "Monthly plan credits reset each billing period. Top-up pack credits never expire." },
              { q: "What PDF format is output?", a: "Interior PDFs at 8.5×11\" (612×792 points) and a cover PDF with correct KDP dimensions including spine." },
              { q: "Which AI model generates images?", a: "We use OpenAI DALL-E 3, the most capable model for stylistically consistent book illustration." },
              { q: "Can I cancel anytime?", a: "Yes, cancel your subscription at any time. You keep access until the end of your billing period." },
            ].map(({ q, a }) => (
              <div key={q} className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
