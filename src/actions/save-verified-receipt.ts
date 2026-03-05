'use server'

import { z } from 'zod'
import { authActionClient } from '@/lib/safe-action'
import { prisma } from '@/lib/db'

const saveVerifiedReceiptSchema = z.object({
  receiptId: z.string().min(1, 'Receipt ID is required'),
  vendorName: z.string().min(1, 'Vendor name is required'),
  totalAmount: z.number().positive('Amount must be positive'),
  receiptDate: z.string().nullable(),
  taxAmount: z.number().min(0).nullable(),
  paymentType: z.enum(['cash', 'card', 'other']).nullable(),
})

export const saveVerifiedReceipt = authActionClient
  .schema(saveVerifiedReceiptSchema)
  .action(
    async ({
      parsedInput: { receiptId, vendorName, totalAmount, receiptDate, taxAmount, paymentType },
      ctx: { userId },
    }) => {
      // Verify receipt exists and belongs to user
      const receipt = await prisma.capturedReceipt.findUnique({
        where: { id: receiptId },
        select: { id: true, userId: true },
      })

      if (!receipt || receipt.userId !== userId) {
        throw new Error('Receipt not found')
      }

      // Persist verified data
      const updated = await prisma.capturedReceipt.update({
        where: { id: receiptId },
        data: {
          vendorName,
          totalAmount,
          receiptDate: receiptDate ? new Date(receiptDate) : null,
          taxAmount,
          paymentType,
          verifiedAt: new Date(),
        },
        select: {
          id: true,
          verifiedAt: true,
        },
      })

      return { id: updated.id, verifiedAt: updated.verifiedAt }
    }
  )
