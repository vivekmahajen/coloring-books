import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

const PAGE_WIDTH = 8.5 * 72;
const PAGE_HEIGHT = 11 * 72;

function fillPageWhite(page: ReturnType<PDFDocument["addPage"]>) {
  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: rgb(1, 1, 1) });
}

export async function assemblePDF(imageUrls: string[], title: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(title);
  pdfDoc.setCreator("BookGen AI");

  for (const url of imageUrls) {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    fillPageWhite(page);

    try {
      const res = await fetch(url);
      const arrayBuffer = await res.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      let image;
      try {
        image = await pdfDoc.embedPng(bytes);
      } catch {
        image = await pdfDoc.embedJpg(bytes);
      }

      const { width, height } = image.scaleToFit(PAGE_WIDTH - 72, PAGE_HEIGHT - 72);
      const x = (PAGE_WIDTH - width) / 2;
      const y = (PAGE_HEIGHT - height) / 2;
      page.drawImage(image, { x, y, width, height });
    } catch {
      // page remains white on fetch failure
    }
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}

export async function assembleCoverPDF(
  coverImageUrl: string,
  title: string,
  pageCount: number
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const spineWidth = pageCount * 0.06 * 72;
  const coverWidth = PAGE_WIDTH * 2 + spineWidth;
  const page = pdfDoc.addPage([coverWidth, PAGE_HEIGHT]);

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  page.drawRectangle({ x: 0, y: 0, width: coverWidth, height: PAGE_HEIGHT, color: rgb(0.2, 0.1, 0.5) });

  try {
    const res = await fetch(coverImageUrl);
    const arrayBuffer = await res.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    let image;
    try {
      image = await pdfDoc.embedPng(bytes);
    } catch {
      image = await pdfDoc.embedJpg(bytes);
    }

    // Front cover
    page.drawImage(image, { x: PAGE_WIDTH + spineWidth, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });
    // Back cover (faded)
    page.drawImage(image, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, opacity: 0.3 });
  } catch {
    // keep plain background
  }

  const fontSize = Math.min(spineWidth * 0.5, 12);
  if (fontSize > 4) {
    page.drawText(title, {
      x: PAGE_WIDTH + spineWidth / 2 - fontSize / 2,
      y: PAGE_HEIGHT * 0.2,
      font,
      size: fontSize,
      color: rgb(1, 1, 1),
      rotate: degrees(90),
    });
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
