"use server"

import { prisma } from "@/lib/db"
import { authActionClient } from "@/lib/safe-action"
import { saveVerifiedReceiptSchema } from "@/schemas"

export const saveVerifiedReceipt = authActionClient
  .inputSchema(saveVerifiedReceiptSchema)
  .action(
    async ({
      parsedInput: {
        receiptId,
        vendorName,
        totalAmount,
        receiptDate,
        taxAmount,
        paymentType,
        lineItems,
      },
      ctx: { userId },
    }) => {
      // Verify receipt exists and belongs to user
      const receipt = await prisma.capturedReceipt.findUnique({
        where: { id: receiptId },
        select: { id: true, userId: true },
      })

      if (!receipt || receipt.userId !== userId) {
        throw new Error("Receipt not found")
      }

      // Persist verified data (line items stored in rawExtraction JSON for now)
      const updated = await prisma.capturedReceipt.update({
        where: { id: receiptId },
        data: {
          vendorName,
          totalAmount,
          receiptDate: receiptDate ? new Date(receiptDate) : null,
          taxAmount,
          paymentType,
          verifiedAt: new Date(),
          rawExtraction: {
            verified: true,
            lineItems,
          },
        },
        select: {
          id: true,
          verifiedAt: true,
        },
      })

      return { id: updated.id, verifiedAt: updated.verifiedAt }
    },
  )
