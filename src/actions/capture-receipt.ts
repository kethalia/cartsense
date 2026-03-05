'use server'

import { z } from 'zod'
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
  .action(async ({ parsedInput: { imageData, mimeType, fileSize }, ctx: { clerkId } }) => {
    // Look up or create User record (sync Clerk user to local DB)
    let user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId,
          email: `${clerkId}@placeholder.local`,
        },
        select: { id: true },
      })
    }

    const receipt = await prisma.capturedReceipt.create({
      data: {
        userId: user.id,
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
  })
