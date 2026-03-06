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
        categoryId,
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

      // Build VAT breakdown from individual item vatRates
      const vatMap = new Map<number, number>()
      for (const item of lineItems) {
        if (item.vatRate != null) {
          const rate = item.vatRate
          const vatAmount = (item.totalPrice * rate) / (100 + rate)
          vatMap.set(rate, (vatMap.get(rate) ?? 0) + vatAmount)
        }
      }
      const vatBreakdown =
        vatMap.size > 0
          ? Array.from(vatMap.entries()).map(([rate, amount]) => ({
              rate,
              amount: Math.round(amount * 100) / 100,
            }))
          : null

      // Look up product category IDs for line items
      const productCategorySlugs = [
        ...new Set(
          lineItems
            .map((i) => i.productCategory)
            .filter((s): s is string => s != null),
        ),
      ]

      const productCategories =
        productCategorySlugs.length > 0
          ? await prisma.category.findMany({
              where: {
                slug: { in: productCategorySlugs },
                type: "product",
                isCustom: false,
              },
              select: { id: true, slug: true },
            })
          : []

      const categorySlugToId = new Map(
        productCategories.map((c) => [c.slug, c.id]),
      )

      // Atomic transaction: update receipt + replace line items
      const updated = await prisma.$transaction(async (tx) => {
        // Delete existing items (idempotent re-save)
        await tx.receiptItem.deleteMany({
          where: { receiptId },
        })

        // Create new ReceiptItems from verified data
        if (lineItems.length > 0) {
          await tx.receiptItem.createMany({
            data: lineItems.map((item, index) => ({
              receiptId,
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              vatRate: item.vatRate ?? null,
              vatAmount:
                item.vatRate != null
                  ? Math.round(
                      ((item.totalPrice * item.vatRate) /
                        (100 + item.vatRate)) *
                        100,
                    ) / 100
                  : null,
              categoryId: item.productCategory
                ? (categorySlugToId.get(item.productCategory) ?? null)
                : null,
              sortOrder: index,
            })),
          })
        }

        // Update receipt with verified data
        const result = await tx.capturedReceipt.update({
          where: { id: receiptId },
          data: {
            vendorName,
            totalAmount,
            receiptDate: receiptDate ? new Date(receiptDate) : null,
            taxAmount,
            paymentType,
            categoryId: categoryId ?? null,
            vatBreakdown: vatBreakdown
              ? JSON.parse(JSON.stringify(vatBreakdown))
              : null,
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

        return result
      })

      return { id: updated.id, verifiedAt: updated.verifiedAt }
    },
  )
