"use server"

import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/db"
import { authActionClient } from "@/lib/safe-action"
import { searchReceiptsSchema } from "@/schemas"

export const searchReceipts = authActionClient
  .inputSchema(searchReceiptsSchema)
  .action(
    async ({
      parsedInput: {
        query,
        categoryId,
        dateFrom,
        dateTo,
        amountMin,
        amountMax,
      },
      ctx: { userId },
    }) => {
      const where: Prisma.CapturedReceiptWhereInput = { userId }
      const andConditions: Prisma.CapturedReceiptWhereInput[] = []

      // Text search: vendor name, product names, or exact amount
      if (query && query.trim()) {
        const q = query.trim()
        const orConditions: Prisma.CapturedReceiptWhereInput[] = [
          { vendorName: { contains: q, mode: "insensitive" } },
          {
            items: {
              some: { name: { contains: q, mode: "insensitive" } },
            },
          },
        ]

        // If query looks like a number, also match amount
        const parsed = parseFloat(q)
        if (!isNaN(parsed) && parsed > 0) {
          orConditions.push({ totalAmount: { equals: parsed } })
        }

        andConditions.push({ OR: orConditions })
      }

      // Category filter
      if (categoryId) {
        andConditions.push({ categoryId: { equals: categoryId } })
      }

      // Date range filter
      if (dateFrom || dateTo) {
        const dateFilter: Prisma.CapturedReceiptWhereInput[] = []
        if (dateFrom) {
          dateFilter.push({
            OR: [
              { receiptDate: { gte: new Date(dateFrom) } },
              {
                receiptDate: null,
                capturedAt: { gte: new Date(dateFrom) },
              },
            ],
          })
        }
        if (dateTo) {
          // Set to end of day
          const endDate = new Date(dateTo)
          endDate.setHours(23, 59, 59, 999)
          dateFilter.push({
            OR: [
              { receiptDate: { lte: endDate } },
              {
                receiptDate: null,
                capturedAt: { lte: endDate },
              },
            ],
          })
        }
        andConditions.push(...dateFilter)
      }

      // Amount range filter
      if (amountMin !== undefined || amountMax !== undefined) {
        const amountFilter: Prisma.CapturedReceiptWhereInput = {}
        if (amountMin !== undefined) {
          amountFilter.totalAmount = {
            ...((amountFilter.totalAmount as object) ?? {}),
            gte: amountMin,
          }
        }
        if (amountMax !== undefined) {
          amountFilter.totalAmount = {
            ...((amountFilter.totalAmount as object) ?? {}),
            lte: amountMax,
          }
        }
        andConditions.push(amountFilter)
      }

      if (andConditions.length > 0) {
        where.AND = andConditions
      }

      const receipts = await prisma.capturedReceipt.findMany({
        where,
        orderBy: [{ receiptDate: "desc" }, { capturedAt: "desc" }],
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
          items: {
            select: {
              name: true,
            },
          },
        },
      })

      // Build match context for highlighting
      const matchContext: Record<
        string,
        { field: string; matchedText: string }[]
      > = {}

      if (query && query.trim()) {
        const q = query.trim().toLowerCase()
        for (const receipt of receipts) {
          const matches: { field: string; matchedText: string }[] = []

          if (
            receipt.vendorName &&
            receipt.vendorName.toLowerCase().includes(q)
          ) {
            matches.push({
              field: "vendorName",
              matchedText: receipt.vendorName,
            })
          }

          for (const item of receipt.items) {
            if (item.name.toLowerCase().includes(q)) {
              matches.push({ field: "itemName", matchedText: item.name })
            }
          }

          if (matches.length > 0) {
            matchContext[receipt.id] = matches
          }
        }
      }

      return {
        receipts: receipts.map((r) => ({
          id: r.id,
          vendorName: r.vendorName,
          totalAmount: r.totalAmount ? Number(r.totalAmount) : null,
          receiptDate: r.receiptDate,
          capturedAt: r.capturedAt,
          categoryId: r.categoryId,
          category: r.category,
          imageData: r.imageData,
          mimeType: r.mimeType,
        })),
        matchContext,
      }
    },
  )
