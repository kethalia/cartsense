"use server"

import { z } from "zod"
import { prisma } from "@/lib/db"
import { authActionClient } from "@/lib/safe-action"

// ── Get receipts with category data for dashboard list ──

export const getReceiptList = authActionClient.action(
  async ({ ctx: { userId } }) => {
    const receipts = await prisma.capturedReceipt.findMany({
      where: { userId },
      orderBy: { capturedAt: "desc" },
      select: {
        id: true,
        vendorName: true,
        totalAmount: true,
        receiptDate: true,
        capturedAt: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            nameRo: true,
            slug: true,
            color: true,
            icon: true,
          },
        },
        imageData: true,
        mimeType: true,
      },
    })

    return {
      receipts: receipts.map((r) => ({
        ...r,
        totalAmount: r.totalAmount ? Number(r.totalAmount) : null,
      })),
    }
  },
)

// ── Update receipt category ──

const updateReceiptCategorySchema = z.object({
  receiptId: z.string().min(1),
  categoryId: z.string().nullable(),
})

export const updateReceiptCategory = authActionClient
  .inputSchema(updateReceiptCategorySchema)
  .action(
    async ({ parsedInput: { receiptId, categoryId }, ctx: { userId } }) => {
      // Verify receipt ownership
      const receipt = await prisma.capturedReceipt.findFirst({
        where: { id: receiptId, userId },
        select: { id: true },
      })

      if (!receipt) {
        throw new Error("Receipt not found")
      }

      const updated = await prisma.capturedReceipt.update({
        where: { id: receiptId },
        data: { categoryId },
        select: {
          id: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true,
              nameRo: true,
              slug: true,
              color: true,
              icon: true,
            },
          },
        },
      })

      return { receipt: updated }
    },
  )
