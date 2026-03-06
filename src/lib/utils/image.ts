import sharp from "sharp";
import { MAX_STORED_BYTES } from "@/lib/config";

/**
 * Compress image for storage. Outputs JPEG, progressively reducing
 * quality and dimensions until the base64 payload is under 4.5 MB.
 * Accepts a raw Buffer (no base64 decode needed).
 */
export async function compressForStorage(
  buffer: Buffer,
): Promise<{ base64: string; mimeType: "image/jpeg"; bytes: number }> {
  const attempts: { quality: number; maxDim: number }[] = [
    { quality: 90, maxDim: 2048 },
    { quality: 85, maxDim: 2048 },
    { quality: 80, maxDim: 1600 },
    { quality: 70, maxDim: 1400 },
    { quality: 60, maxDim: 1200 },
  ];

  for (const { quality, maxDim } of attempts) {
    const output = await sharp(buffer)
      .resize(maxDim, maxDim, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();

    if (output.length <= MAX_STORED_BYTES) {
      console.log(
        `[capture-receipt] Compressed: ${(buffer.length / 1024 / 1024).toFixed(1)}MB → ${(output.length / 1024 / 1024).toFixed(1)}MB (q=${quality}, max=${maxDim}px)`,
      );
      return {
        base64: output.toString("base64"),
        mimeType: "image/jpeg",
        bytes: output.length,
      };
    }
  }

  // Last resort
  const output = await sharp(buffer)
    .resize(640, 640, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 30 })
    .toBuffer();

  return {
    base64: output.toString("base64"),
    mimeType: "image/jpeg",
    bytes: output.length,
  };
}
