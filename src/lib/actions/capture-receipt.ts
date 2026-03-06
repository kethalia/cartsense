"use server";

import sharp from "sharp";
import { createHash } from "crypto";
import { authActionClient } from "@/lib/safe-action";
import { prisma } from "@/lib/db";
import { captureReceiptSchema } from "@/schemas";
import { compressForStorage } from "@/lib/utils/image";

export const captureReceipt = authActionClient
  .inputSchema(captureReceiptSchema)
  .action(async ({ parsedInput: { image }, ctx: { userId } }) => {
    // Verify user exists in DB (Better Auth should have created them)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error("Account not found. Please sign out and sign in again.");
    }

    // Compress: raw File → Buffer → sharp (no base64 decode step)
    const buffer = Buffer.from(await image.arrayBuffer());
    const compressed = await compressForStorage(buffer);

    const imageHash = createHash("sha256")
      .update(compressed.base64)
      .digest("hex");

    try {
      const receipt = await prisma.capturedReceipt.create({
        data: {
          userId,
          imageHash,
          imageData: compressed.base64,
          mimeType: compressed.mimeType,
          fileSize: compressed.bytes,
        },
        select: {
          id: true,
          capturedAt: true,
        },
      });

      return { id: receipt.id, capturedAt: receipt.capturedAt };
    } catch (e: unknown) {
      // Prisma unique constraint violation = duplicate image
      if (
        typeof e === "object" &&
        e !== null &&
        "code" in e &&
        (e as { code: string }).code === "P2002"
      ) {
        throw new Error("This receipt has already been uploaded.");
      }
      throw new Error("Failed to save receipt. Please try again.");
    }
  });
