import Link from "next/link";
import { NavAuthButtons } from "@/components/NavAuth";
import { BookOpen, Wand2, Download, Star, Zap, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-50">
        <Link href="/" className="font-bold text-xl text-indigo-600">BookGen AI</Link>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</Link>
          <NavAuthButtons />
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Zap className="w-3.5 h-3.5" />
          AI-powered book generation
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 max-w-3xl leading-tight">
          Create &amp; sell books with{" "}
          <span className="text-indigo-600">AI in minutes</span>
        </h1>
        <p className="mt-6 text-xl text-gray-600 max-w-2xl">
          Generate coloring books, kids storybooks, and activity books. Get KDP-ready PDFs instantly — no design skills needed.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link href="/sign-up" className="bg-indigo-600 text-white text-lg px-8 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
            Start 7-day free trial
          </Link>
          <Link href="/pricing" className="bg-white text-gray-800 text-lg px-8 py-3.5 rounded-xl font-semibold border border-gray-200 hover:border-gray-300 transition">
            See pricing
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-400">No credit card required · 7-day free trial · Cancel anytime</p>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">How it works</h2>
          <p className="text-center text-gray-500 mb-16">Three steps from idea to published book</p>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: Wand2, step: "1", title: "Describe your book", desc: "Enter a theme, pick your book type, style, and page count. Our AI handles the rest." },
              { icon: BookOpen, step: "2", title: "AI generates pages", desc: "DALL-E 3 creates unique illustrations for every page, tailored to your style." },
              { icon: Download, step: "3", title: "Download & publish", desc: "Get a KDP-ready PDF with correct dimensions. Upload straight to Amazon and start selling." },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7 text-indigo-600" />
                </div>
                <div className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-2">Step {step}</div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Book types */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Three book types, one platform</h2>
          <p className="text-center text-gray-500 mb-16">From toddler coloring pages to intricate adult mandalas</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { emoji: "🎨", title: "Coloring Books", desc: "Bold black & white line art — simple for kids, intricate for adults. Perfect for KDP Low Content publishing.", badge: "Most popular" },
              { emoji: "📖", title: "Kids Storybooks", desc: "Illustrated story pages with whimsical characters. Generate a complete picture book with a cohesive visual style.", badge: null },
              { emoji: "✏️", title: "Activity Books", desc: "Puzzles, mazes, dot-to-dot, and word searches. Keep kids entertained with unique educational content.", badge: null },
            ].map(({ emoji, title, desc, badge }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-200 relative">
                {badge && (
                  <span className="absolute -top-3 left-6 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">{badge}</span>
                )}
                <div className="text-4xl mb-4">{emoji}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Loved by creators &amp; publishers</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Sarah K.", role: "KDP Publisher", quote: "I published my first coloring book in a weekend. It would have taken months to do this manually." },
              { name: "James R.", role: "Homeschool Parent", quote: "The activity books are incredible. My kids actually want to sit down and do the pages." },
              { name: "Maria L.", role: "Etsy Seller", quote: "I generate 10 new books a month and sell them on Etsy. Best investment I've made for my business." },
            ].map(({ name, role, quote }) => (
              <div key={name} className="bg-gray-50 rounded-2xl p-6">
                <p className="text-gray-700 text-sm leading-relaxed mb-4">&ldquo;{quote}&rdquo;</p>
                <div>
                  <div className="font-semibold text-sm text-gray-900">{name}</div>
                  <div className="text-xs text-gray-500">{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-indigo-600 text-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Everything you need to publish</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Wand2, title: "DALL-E 3 powered", desc: "State-of-the-art image generation with prompt engineering optimized for book publishing." },
              { icon: Download, title: "KDP-ready PDFs", desc: "Interior and cover PDFs at exact Amazon KDP specifications. Upload directly, no reformatting." },
              { icon: Shield, title: "Commercial license", desc: "Everything you generate is yours to sell. Full commercial rights included in all plans." },
              { icon: BookOpen, title: "Up to 40 pages", desc: "Generate books from 8 to 40 pages. Bulk generation lets you create entire series fast." },
              { icon: Zap, title: "Minutes, not months", desc: "What used to take weeks of design work now takes under 10 minutes start to finish." },
              { icon: Star, title: "Credit system", desc: "Pay only for what you generate. Top up credits anytime, they never expire." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-indigo-200 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-white text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to publish your first book?</h2>
        <p className="text-gray-500 mb-10 text-lg">Join thousands of creators generating passive income with AI books.</p>
        <Link href="/sign-up" className="bg-indigo-600 text-white text-lg px-10 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
          Start 7-day free trial
        </Link>
        <p className="mt-4 text-sm text-gray-400">No credit card required · Cancel anytime</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
        <span className="font-semibold text-gray-700">BookGen AI</span>
        <div className="flex gap-6 mt-4 sm:mt-0">
          <Link href="/pricing" className="hover:text-gray-700">Pricing</Link>
          <Link href="/sign-in" className="hover:text-gray-700">Sign in</Link>
        </div>
      </footer>
    </div>
  );
}
