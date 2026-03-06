"use server"

import { IMAGE_ENHANCE_ENABLED } from "@/lib/config"
import { prisma } from "@/lib/db"
import { extractReceiptData } from "@/lib/prompts/extract-receipt"
import { authActionClient } from "@/lib/safe-action"
import { enhanceReceiptImage } from "@/lib/utils/image-enhance"
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
      // Enhance image for better OCR accuracy (original preserved in DB)
      const processedImage = IMAGE_ENHANCE_ENABLED
        ? await enhanceReceiptImage(receipt.imageData)
        : receipt.imageData

      const result = await extractReceiptData(processedImage, receipt.mimeType)

      // Look up receipt-level category from AI suggestion
      let categoryId: string | null = null
      if (result.receiptCategory) {
        const category = await prisma.category.findFirst({
          where: {
            slug: result.receiptCategory,
            type: "receipt",
            isCustom: false,
          },
          select: { id: true },
        })
        categoryId = category?.id ?? null
      }

      await prisma.capturedReceipt.update({
        where: { id: receiptId },
        data: {
          extractionStatus: "completed",
          vendorName: result.vendorName,
          totalAmount: result.totalAmount,
          receiptDate: result.receiptDate ? new Date(result.receiptDate) : null,
          taxAmount: result.taxAmount,
          paymentType: result.paymentType,
          categoryId,
          vatBreakdown: result.vatBreakdown
            ? JSON.parse(JSON.stringify(result.vatBreakdown))
            : null,
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
