'use server'

import { z } from 'zod'
import { createHash } from 'crypto'
import { authActionClient } from '@/lib/safe-action'
import { prisma } from '@/lib/db'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

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

    const imageHash = createHash('sha256').update(imageData).digest('hex')

    try {
      const receipt = await prisma.capturedReceipt.create({
        data: {
          userId,
          imageHash,
          imageData,
          mimeType,
          fileSize: fileSize ?? null,
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
