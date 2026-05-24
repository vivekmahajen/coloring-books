import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { UserButton } from "@clerk/nextjs";
import { Plus, BookOpen, Zap, Clock, CheckCircle, XCircle, Loader2, Shield, AlertCircle } from "lucide-react";
import { BOOK_TYPE_LABELS, STATUS_LABELS, formatDate } from "@/lib/utils";
import { trialEndsAt, isAdminEmail, isTrialActive, trialDaysLeft, canGenerateFree } from "@/lib/access";

async function getOrCreateUser(clerkId: string, email: string) {
  const admin = isAdminEmail(email);
  return db.user.upsert({
    where: { clerkId },
    update: { isAdmin: admin },
    create: {
      clerkId,
      email,
      credits: 0,
      trialEndsAt: admin ? null : trialEndsAt(),
      isAdmin: admin,
    },
  });
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  READY: <CheckCircle className="w-4 h-4 text-green-500" />,
  GENERATING: <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />,
  PENDING: <Clock className="w-4 h-4 text-yellow-500" />,
  FAILED: <XCircle className="w-4 h-4 text-red-500" />,
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";

  const user = await getOrCreateUser(userId, email);
  const books = await db.book.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const trialActive = isTrialActive(user.trialEndsAt);
  const daysLeft = trialDaysLeft(user.trialEndsAt);
  const freeAccess = canGenerateFree(user);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="border-b border-gray-100 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="font-bold text-xl text-indigo-600">BookGen AI</Link>
        <div className="flex items-center gap-3">
          {user.isAdmin && (
            <div className="flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
              <Shield className="w-3.5 h-3.5" />
              Admin
            </div>
          )}
          {!user.isAdmin && freeAccess && (
            <div className="flex items-center gap-1.5 bg-green-100 text-green-700 text-sm font-semibold px-3 py-1.5 rounded-full">
              <Zap className="w-3.5 h-3.5" />
              Free trial · {daysLeft}d left
            </div>
          )}
          {!freeAccess && (
            <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-sm font-semibold px-3 py-1.5 rounded-full">
              <Zap className="w-3.5 h-3.5" />
              {user.credits} credits
            </div>
          )}
          {!user.isAdmin && (
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
              {freeAccess ? "View plans" : "Buy credits"}
            </Link>
          )}
          <UserButton />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Trial banner */}
        {user.isAdmin && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Admin account</p>
              <p className="text-sm text-amber-700 mt-0.5">You have unlimited generation access. Credits are never deducted.</p>
            </div>
          </div>
        )}
        {!user.isAdmin && trialActive && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800">
                  Free trial active — {daysLeft} day{daysLeft === 1 ? "" : "s"} remaining
                </p>
                <p className="text-sm text-green-700 mt-0.5">
                  Generate unlimited books during your trial. No credit card required.
                </p>
              </div>
            </div>
            <Link href="/pricing" className="shrink-0 text-xs font-semibold bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition">
              Upgrade
            </Link>
          </div>
        )}
        {!user.isAdmin && !trialActive && user.credits === 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">Your free trial has ended</p>
                <p className="text-sm text-red-700 mt-0.5">Subscribe to a plan or top up credits to keep generating books.</p>
              </div>
            </div>
            <Link href="/pricing" className="shrink-0 text-xs font-semibold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition">
              See plans
            </Link>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Books</h1>
            <p className="text-gray-500 text-sm mt-1">
              {books.length === 0 ? "Create your first book below" : `${books.length} book${books.length === 1 ? "" : "s"} generated`}
            </p>
          </div>
          <Link
            href="/create"
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" />
            New book
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-2xl font-bold text-gray-900">{books.length}</div>
            <div className="text-sm text-gray-500 mt-1">Total books</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-2xl font-bold text-gray-900">{books.reduce((s, b) => s + b.pageCount, 0)}</div>
            <div className="text-sm text-gray-500 mt-1">Pages generated</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-2xl font-bold text-gray-900">
              {user.isAdmin ? "∞" : freeAccess ? `${daysLeft}d` : user.credits}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {user.isAdmin ? "Unlimited (admin)" : freeAccess ? "Trial days left" : "Credits remaining"}
            </div>
          </div>
        </div>

        {/* Books grid */}
        {books.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center py-24">
            <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium mb-4">No books yet</p>
            <Link href="/create" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition">
              Create your first book
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-indigo-300 hover:shadow-md transition group"
              >
                <div className="h-44 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  {book.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
                  ) : (
                    <BookOpen className="w-12 h-12 text-indigo-300" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-indigo-600 transition line-clamp-2">
                      {book.title}
                    </h3>
                    <span className="shrink-0">{STATUS_ICONS[book.status]}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {BOOK_TYPE_LABELS[book.type]}
                    </span>
                    <span className="text-xs text-gray-400">{book.pageCount}p</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400">{formatDate(book.createdAt)}</span>
                    <span className="text-xs text-gray-500">{STATUS_LABELS[book.status]}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
