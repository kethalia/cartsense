import sharp from "sharp"

/**
 * Enhance receipt image for better AI/OCR accuracy.
 * Pipeline: normalize → sharpen → contrast boost → grayscale → JPEG output.
 * Does NOT resize — images are already compressed to max 4.5MB by the capture flow.
 * The original image is preserved in the database; only the AI sees the enhanced version.
 */
export async function enhanceReceiptImage(base64: string): Promise<string> {
  const buffer = Buffer.from(base64, "base64")

  const enhanced = await sharp(buffer)
    .normalize() // Auto-level: expands dynamic range for faded receipts
    .sharpen({ sigma: 1.0 }) // Improve text edges
    .linear(1.15, -(128 * 0.15)) // Subtle contrast increase
    .grayscale() // Remove color noise, focus on text
    .jpeg({ quality: 95 }) // High quality to preserve text detail
    .toBuffer()

  return enhanced.toString("base64")
}
