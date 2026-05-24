import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const book = await db.book.findUnique({ where: { id } });
  if (!book || book.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (book.status !== "READY" || !book.pdfUrl) {
    return NextResponse.json({ error: "PDF not ready" }, { status: 409 });
  }

  // Proxy the Vercel Blob PDF so the download uses the book title as filename
  const res = await fetch(book.pdfUrl);
  const blob = await res.blob();
  const safeTitle = book.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();

  return new NextResponse(blob, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeTitle}_interior.pdf"`,
    },
  });
}
