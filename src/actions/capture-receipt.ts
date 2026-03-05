'use server'

import { z } from 'zod'
import sharp from 'sharp'
import { createHash } from 'crypto'
import { authActionClient } from '@/lib/safe-action'
import { prisma } from '@/lib/db'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const MAX_STORED_BYTES = 4.5 * 1024 * 1024 // 4.5 MB target (fits Claude's 5 MB limit)

/**
 * Compress image for storage. Outputs JPEG, progressively reducing
 * quality and dimensions until the base64 payload is under 4.5 MB.
 */
async function compressForStorage(
  base64Data: string,
): Promise<{ base64: string; mimeType: 'image/jpeg'; bytes: number }> {
  const inputBuffer = Buffer.from(base64Data, 'base64')

  const attempts: { quality: number; maxDim: number }[] = [
    { quality: 90, maxDim: 2048 },
    { quality: 85, maxDim: 2048 },
    { quality: 80, maxDim: 1600 },
    { quality: 70, maxDim: 1400 },
    { quality: 60, maxDim: 1200 },
  ]

  for (const { quality, maxDim } of attempts) {
    const output = await sharp(inputBuffer)
      .resize(maxDim, maxDim, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer()

    if (output.length <= MAX_STORED_BYTES) {
      console.log(
        `[capture-receipt] Compressed: ${(inputBuffer.length / 1024 / 1024).toFixed(1)}MB → ${(output.length / 1024 / 1024).toFixed(1)}MB (q=${quality}, max=${maxDim}px)`,
      )
      return { base64: output.toString('base64'), mimeType: 'image/jpeg', bytes: output.length }
    }
  }

  // Last resort
  const output = await sharp(inputBuffer)
    .resize(640, 640, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 30 })
    .toBuffer()

  return { base64: output.toString('base64'), mimeType: 'image/jpeg', bytes: output.length }
}

const captureReceiptSchema = z.object({
  imageData: z.string().min(1, 'Image data is required'),
  mimeType: z.string().regex(/^image\//, 'Must be an image type'),
  fileSize: z.number().max(MAX_FILE_SIZE, 'File too large: maximum 10MB').optional(),
})

export const captureReceipt = authActionClient
  .schema(captureReceiptSchema)
  .action(async ({ parsedInput: { imageData, mimeType, fileSize }, ctx: { userId } }) => {
    // Verify user exists in DB (Better Auth should have created them)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!user) {
      throw new Error('Account not found. Please sign out and sign in again.')
    }

    // Compress before storing — keeps DB lean and image ready for Claude
    const compressed = await compressForStorage(imageData)

    const imageHash = createHash('sha256').update(compressed.base64).digest('hex')

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
      })

      return { id: receipt.id, capturedAt: receipt.capturedAt }
    } catch (e: unknown) {
      // Prisma unique constraint violation = duplicate image
      if (typeof e === 'object' && e !== null && 'code' in e && (e as { code: string }).code === 'P2002') {
        throw new Error('This receipt has already been uploaded.')
      }
      throw new Error('Failed to save receipt. Please try again.')
    }
  })
