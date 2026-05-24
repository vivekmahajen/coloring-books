import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { UserButton } from "@clerk/nextjs";
import { Plus, BookOpen, Zap, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { BOOK_TYPE_LABELS, STATUS_LABELS, formatDate } from "@/lib/utils";

async function getOrCreateUser(clerkId: string, email: string) {
  return db.user.upsert({
    where: { clerkId },
    update: {},
    create: { clerkId, email, credits: 10 },
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="border-b border-gray-100 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="font-bold text-xl text-indigo-600">BookGen AI</Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-sm font-semibold px-3 py-1.5 rounded-full">
            <Zap className="w-3.5 h-3.5" />
            {user.credits} credits
          </div>
          <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">Buy credits</Link>
          <UserButton />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
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
          {[
            { label: "Total books", value: books.length },
            { label: "Pages generated", value: books.reduce((s, b) => s + b.pageCount, 0) },
            { label: "Credits remaining", value: user.credits },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-sm text-gray-500 mt-1">{label}</div>
            </div>
          ))}
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
                {/* Cover placeholder */}
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
