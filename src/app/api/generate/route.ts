import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generatePageImage, generateCoverImage } from "@/lib/openai";
import { assemblePDF, assembleCoverPDF } from "@/lib/pdf";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type, theme, style, pageCount, title } = body;

  if (!type || !theme || !style || !pageCount || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.credits < pageCount) {
    return NextResponse.json(
      { error: `Not enough credits. You need ${pageCount} credits but have ${user.credits}.` },
      { status: 402 }
    );
  }

  // Create book and pages, deduct credits atomically
  const [book] = await db.$transaction([
    db.book.create({
      data: {
        userId: user.id,
        type,
        theme,
        style,
        pageCount,
        title,
        status: "GENERATING",
        pages: {
          create: Array.from({ length: pageCount }, (_, i) => ({
            pageNumber: i + 1,
            prompt: `${theme}, page ${i + 1}`,
          })),
        },
      },
    }),
    db.user.update({
      where: { id: user.id },
      data: { credits: { decrement: pageCount } },
    }),
    db.transaction.create({
      data: {
        userId: user.id,
        creditsDelta: -pageCount,
        type: "SPEND",
        description: `Generated "${title}" (${pageCount} pages)`,
      },
    }),
  ]);

  // Run generation asynchronously — don't await, return bookId immediately
  generateBook(book.id, type, theme, style, pageCount, title).catch(async (err) => {
    console.error("Generation failed for book", book.id, err);
    await db.book.update({ where: { id: book.id }, data: { status: "FAILED" } });
    // Refund credits on failure
    await db.$transaction([
      db.user.update({ where: { id: user.id }, data: { credits: { increment: pageCount } } }),
      db.transaction.create({
        data: { userId: user.id, creditsDelta: pageCount, type: "REFUND", description: `Refund for failed book "${title}"` },
      }),
    ]);
  });

  return NextResponse.json({ bookId: book.id });
}

async function generateBook(
  bookId: string,
  type: string,
  theme: string,
  style: string,
  pageCount: number,
  title: string
) {
  const pages = await db.page.findMany({
    where: { bookId },
    orderBy: { pageNumber: "asc" },
  });

  const imageUrls: string[] = [];

  for (const page of pages) {
    const url = await generatePageImage(theme, type, style, page.pageNumber, pageCount);
    await db.page.update({ where: { id: page.id }, data: { imageUrl: url } });
    imageUrls.push(url);
  }

  // Generate cover
  const coverUrl = await generateCoverImage(title, theme, type);
  await db.book.update({ where: { id: bookId }, data: { coverUrl } });

  // Assemble interior PDF
  const pdfBytes = await assemblePDF(imageUrls, title);
  const { url: pdfUrl } = await put(`books/${bookId}/interior.pdf`, pdfBytes, {
    access: "public",
    contentType: "application/pdf",
  });

  // Assemble cover PDF
  const coverPdfBytes = await assembleCoverPDF(coverUrl, title, pageCount);
  await put(`books/${bookId}/cover.pdf`, coverPdfBytes, {
    access: "public",
    contentType: "application/pdf",
  });

  await db.book.update({
    where: { id: bookId },
    data: { status: "READY", pdfUrl },
  });
}
