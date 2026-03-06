"use server"

import { z } from "zod"
import { authActionClient } from "@/lib/safe-action"
import { prisma } from "@/lib/db"

const deleteReceiptSchema = z.object({
  id: z.string().min(1),
})

export const deleteReceipt = authActionClient
  .inputSchema(deleteReceiptSchema)
  .action(async ({ parsedInput: { id }, ctx: { userId } }) => {
    // Only allow deleting own receipts
    const receipt = await prisma.capturedReceipt.findFirst({
      where: { id, userId },
      select: { id: true },
    })

    if (!receipt) {
      throw new Error("Receipt not found.")
    }

    await prisma.capturedReceipt.delete({
      where: { id },
    })

    return { deleted: true }
  })
