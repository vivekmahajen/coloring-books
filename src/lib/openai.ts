import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const STYLE_PREFIXES: Record<string, string> = {
  COLORING:
    "black and white line art, children's coloring book style, bold clean outlines, no shading, no color, pure white background, printable,",
  STORYBOOK:
    "children's book illustration, flat colors, whimsical, cute, soft lighting, storybook style,",
  ACTIVITY:
    "black and white, children's activity book page, clean lines, educational, printable,",
};

const STYLE_SUFFIXES: Record<string, string> = {
  simple: "simple shapes, minimal detail, suitable for young children",
  medium: "moderate detail, fun and whimsical, suitable for ages 6-10",
  intricate: "highly detailed, complex patterns, suitable for older children and adults",
};

export async function generatePageImage(
  theme: string,
  bookType: string,
  style: string,
  pageNumber: number,
  pageCount: number
): Promise<string> {
  const prefix = STYLE_PREFIXES[bookType] ?? STYLE_PREFIXES.COLORING;
  const suffix = STYLE_SUFFIXES[style] ?? STYLE_SUFFIXES.medium;

  const prompt = `${prefix} ${theme}, page ${pageNumber} of ${pageCount}, ${suffix}. Do not include any text or page numbers in the image.`;

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
    response_format: "url",
  });

  const url = response.data?.[0]?.url;
  if (!url) throw new Error("No image URL returned from OpenAI");
  return url;
}

export async function generateCoverImage(
  title: string,
  theme: string,
  bookType: string
): Promise<string> {
  const typeLabel =
    bookType === "COLORING"
      ? "coloring book"
      : bookType === "STORYBOOK"
        ? "children's storybook"
        : "activity book";

  const prompt = `Beautiful ${typeLabel} cover illustration for a book titled "${title}", theme: ${theme}. Colorful, vibrant, eye-catching, professional book cover art, centered composition, no text overlay.`;

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
    response_format: "url",
  });

  const url = response.data?.[0]?.url;
  if (!url) throw new Error("No cover image URL returned from OpenAI");
  return url;
}
