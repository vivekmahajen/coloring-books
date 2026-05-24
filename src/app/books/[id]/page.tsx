import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { UserButton } from "@clerk/nextjs";
import { ArrowLeft, Download, Loader2, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { BOOK_TYPE_LABELS, formatDate } from "@/lib/utils";
import { BookRefresher } from "@/components/BookRefresher";

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/dashboard");

  const book = await db.book.findUnique({
    where: { id },
    include: { pages: { orderBy: { pageNumber: "asc" } } },
  });

  if (!book || book.userId !== dbUser.id) notFound();

  const isGenerating = book.status === "GENERATING" || book.status === "PENDING";
  const isReady = book.status === "READY";
  const isFailed = book.status === "FAILED";

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-100 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="font-bold text-xl text-indigo-600">BookGen AI</Link>
        <UserButton />
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Back + title */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {BOOK_TYPE_LABELS[book.type]}
              </span>
              <span className="text-xs text-gray-400">{book.pageCount} pages</span>
              <span className="text-xs text-gray-400">{formatDate(book.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isGenerating && (
              <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
                <BookRefresher />
              </div>
            )}
            {isReady && (
              <a
                href={`/api/books/${book.id}/download`}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            )}
            {isFailed && (
              <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                <XCircle className="w-4 h-4" />
                Generation failed
              </div>
            )}
          </div>
        </div>

        {/* Status banner */}
        {isGenerating && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-8 flex items-start gap-3">
            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-indigo-800">Generating your book</p>
              <p className="text-sm text-indigo-600 mt-1">
                Our AI is creating {book.pageCount} unique pages. This typically takes 3–8 minutes.
                This page will refresh automatically.
              </p>
            </div>
          </div>
        )}

        {isReady && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-800">Your book is ready!</p>
              <p className="text-sm text-green-600 mt-1">
                Download the KDP-ready PDF below. Interior PDF is formatted at 8.5×11&quot; for Amazon KDP.
              </p>
            </div>
          </div>
        )}

        {isFailed && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">Generation failed</p>
              <p className="text-sm text-red-600 mt-1">
                Something went wrong. Your credits were not deducted. Please try creating a new book.
              </p>
            </div>
          </div>
        )}

        {/* Book info */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Theme</div>
            <div className="text-sm text-gray-900 font-medium">{book.theme}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Style</div>
            <div className="text-sm text-gray-900 font-medium capitalize">{book.style}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</div>
            <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
              {book.status === "READY" && <CheckCircle className="w-4 h-4 text-green-500" />}
              {book.status === "GENERATING" && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
              {book.status === "PENDING" && <Clock className="w-4 h-4 text-yellow-500" />}
              {book.status === "FAILED" && <XCircle className="w-4 h-4 text-red-500" />}
              {book.status}
            </div>
          </div>
        </div>

        {/* Page previews */}
        {book.pages.length > 0 && (
          <div>
            <h2 className="font-semibold text-gray-900 mb-4">
              Pages ({book.pages.filter(p => p.imageUrl).length}/{book.pageCount} generated)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {book.pages.map((page) => (
                <div key={page.id} className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                  {page.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={page.imageUrl}
                      alt={`Page ${page.pageNumber}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      {isGenerating ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <RefreshCw className="w-6 h-6" />
                      )}
                      <span className="text-xs mt-1">Page {page.pageNumber}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
