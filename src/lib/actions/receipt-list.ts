"use server"

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
