"use server"

import { prisma } from "@/lib/db"
import { extractReceiptData } from "@/lib/prompts/extract-receipt"
import { authActionClient } from "@/lib/safe-action"
import { extractReceiptSchema } from "@/schemas"

export const extractReceipt = authActionClient
  .inputSchema(extractReceiptSchema)
  .action(async ({ parsedInput: { receiptId }, ctx: { userId } }) => {
    const receipt = await prisma.capturedReceipt.findUnique({
      where: { id: receiptId },
      select: {
        id: true,
        userId: true,
        imageData: true,
        mimeType: true,
      },
    })

    if (!receipt || receipt.userId !== userId) {
      throw new Error("Receipt not found")
    }

    await prisma.capturedReceipt.update({
      where: { id: receiptId },
      data: { extractionStatus: "processing" },
    })

    try {
      const result = await extractReceiptData(
        receipt.imageData,
        receipt.mimeType,
      )

      await prisma.capturedReceipt.update({
        where: { id: receiptId },
        data: {
          extractionStatus: "completed",
          vendorName: result.vendorName,
          totalAmount: result.totalAmount,
          receiptDate: result.receiptDate ? new Date(result.receiptDate) : null,
          taxAmount: result.taxAmount,
          paymentType: result.paymentType,

          rawExtraction: JSON.parse(JSON.stringify(result)),
        },
      })

      return { status: "success", data: result }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown extraction error"

      console.error("[extract-receipt] AI extraction failed:", errorMessage, {
        receiptId,
      })

      await prisma.capturedReceipt.update({
        where: { id: receiptId },
        data: {
          extractionStatus: "failed",
          rawExtraction: { error: errorMessage },
        },
      })

      return { status: "failed", error: errorMessage }
    }
  })
