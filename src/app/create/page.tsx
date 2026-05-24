"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ArrowLeft, ArrowRight, Wand2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

type BookType = "COLORING" | "STORYBOOK" | "ACTIVITY";
type Style = "simple" | "medium" | "intricate";

interface WizardState {
  type: BookType | null;
  theme: string;
  style: Style;
  pageCount: number;
  title: string;
}

const BOOK_TYPES = [
  { value: "COLORING" as BookType, emoji: "🎨", label: "Coloring Book", desc: "Bold black & white line art for printing and coloring" },
  { value: "STORYBOOK" as BookType, emoji: "📖", label: "Kids Storybook", desc: "Colorful illustrated story pages" },
  { value: "ACTIVITY" as BookType, emoji: "✏️", label: "Activity Book", desc: "Puzzles, mazes, and educational activities" },
];

const STYLES: { value: Style; label: string; desc: string }[] = [
  { value: "simple", label: "Simple", desc: "Minimal detail, ages 2–6" },
  { value: "medium", label: "Medium", desc: "Moderate detail, ages 6–12" },
  { value: "intricate", label: "Intricate", desc: "Highly detailed, teens & adults" },
];

const PAGE_COUNTS = [8, 12, 16, 20, 24, 30, 40];

const STEPS = ["Book type", "Theme", "Style & pages", "Title", "Review"];

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<WizardState>({
    type: null,
    theme: "",
    style: "medium",
    pageCount: 20,
    title: "",
  });

  function update<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function canAdvance(): boolean {
    if (step === 0) return state.type !== null;
    if (step === 1) return state.theme.trim().length >= 5;
    if (step === 2) return true;
    if (step === 3) return state.title.trim().length >= 3;
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Failed to start generation");
      }
      const { bookId } = await res.json();
      toast.success("Generation started! This may take a few minutes.");
      router.push(`/books/${bookId}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-100 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/dashboard" className="font-bold text-xl text-indigo-600">BookGen AI</Link>
        <UserButton />
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold shrink-0",
                i < step ? "bg-indigo-600 text-white" :
                i === step ? "bg-indigo-600 text-white ring-4 ring-indigo-100" :
                "bg-gray-200 text-gray-500"
              )}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={cn("text-xs font-medium hidden sm:block", i === step ? "text-indigo-600" : "text-gray-400")}>
                {label}
              </span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-gray-200 ml-2" />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">

          {/* Step 0: Book type */}
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What kind of book?</h2>
              <p className="text-gray-500 mb-6">Choose the type of book you want to create.</p>
              <div className="grid gap-3">
                {BOOK_TYPES.map(({ value, emoji, label, desc }) => (
                  <button
                    key={value}
                    onClick={() => update("type", value)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition",
                      state.type === value ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <span className="text-3xl">{emoji}</span>
                    <div>
                      <div className="font-semibold text-gray-900">{label}</div>
                      <div className="text-sm text-gray-500">{desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Theme */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What&apos;s the theme?</h2>
              <p className="text-gray-500 mb-6">Describe the subject matter. Be specific for better results.</p>
              <textarea
                value={state.theme}
                onChange={(e) => update("theme", e.target.value)}
                placeholder={
                  state.type === "COLORING" ? "e.g. woodland animals in an enchanted forest, mushrooms, fireflies, cute owls" :
                  state.type === "STORYBOOK" ? "e.g. a brave little robot who learns to make friends on a space station" :
                  "e.g. ocean-themed mazes, connect the dots, word searches for 7-year-olds"
                }
                rows={5}
                className="w-full border border-gray-200 rounded-xl p-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-2">{state.theme.length} characters — aim for 20–200</p>
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick ideas</p>
                <div className="flex flex-wrap gap-2">
                  {(state.type === "COLORING"
                    ? ["Dinosaurs & volcanoes", "Under the sea", "Space adventure", "Fairy tale garden", "Jungle animals"]
                    : state.type === "STORYBOOK"
                    ? ["A dragon who can't fly", "Lost puppy finds home", "A magical library", "Superhero toddler"]
                    : ["Dinosaur mazes", "Number puzzles", "Alphabet dot-to-dot", "Space word searches"]
                  ).map((idea) => (
                    <button
                      key={idea}
                      onClick={() => update("theme", idea)}
                      className="text-xs bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 text-gray-600 px-3 py-1.5 rounded-full transition"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Style & pages */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Style &amp; length</h2>
              <p className="text-gray-500 mb-6">Choose the complexity and how many pages to generate.</p>

              <div className="mb-8">
                <label className="text-sm font-semibold text-gray-700 mb-3 block">Complexity</label>
                <div className="grid grid-cols-3 gap-3">
                  {STYLES.map(({ value, label, desc }) => (
                    <button
                      key={value}
                      onClick={() => update("style", value)}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition",
                        state.style === value ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="font-semibold text-sm text-gray-900">{label}</div>
                      <div className="text-xs text-gray-500 mt-1">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Page count <span className="text-indigo-600 font-bold">{state.pageCount} pages</span>
                  <span className="text-gray-400 font-normal ml-2">= {state.pageCount} credits</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {PAGE_COUNTS.map((n) => (
                    <button
                      key={n}
                      onClick={() => update("pageCount", n)}
                      className={cn(
                        "w-14 h-12 rounded-xl border-2 text-sm font-semibold transition",
                        state.pageCount === n ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-700 hover:border-gray-300"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Title */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Give it a title</h2>
              <p className="text-gray-500 mb-6">This will appear on your book cover and in your library.</p>
              <input
                type="text"
                value={state.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder={
                  state.type === "COLORING" ? "e.g. Enchanted Forest Coloring Book" :
                  state.type === "STORYBOOK" ? "e.g. Rocket the Robot Makes a Friend" :
                  "e.g. Ocean Adventure Activity Book"
                }
                maxLength={80}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-400 mt-2">{state.title.length}/80 characters</p>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Review &amp; generate</h2>
              <div className="space-y-3">
                {[
                  { label: "Book type", value: BOOK_TYPES.find(t => t.value === state.type)?.label },
                  { label: "Theme", value: state.theme },
                  { label: "Style", value: STYLES.find(s => s.value === state.style)?.label },
                  { label: "Pages", value: `${state.pageCount} pages` },
                  { label: "Title", value: state.title },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500 w-24 shrink-0">{label}</span>
                    <span className="text-sm text-gray-900 font-medium">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Cost: {state.pageCount} credits</span> will be deducted from your balance.
                  Generation takes 3–8 minutes depending on page count.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => step === 0 ? router.push("/dashboard") : setStep(s => s - 1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 0 ? "Cancel" : "Back"}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canAdvance()}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate book
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
