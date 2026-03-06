"use server"

import { z } from "zod"
import { prisma } from "@/lib/db"
import { authActionClient } from "@/lib/safe-action"

export const batchSaveAll = authActionClient
  .inputSchema(
    z.object({
      receiptIds: z
        .array(z.string())
        .min(1, "At least one receipt ID required"),
    }),
  )
  .action(async ({ parsedInput: { receiptIds }, ctx: { userId } }) => {
    const result = await prisma.$transaction(
      receiptIds.map((id) =>
        prisma.capturedReceipt.updateMany({
          where: {
            id,
            userId,
            extractionStatus: "completed",
            verifiedAt: null,
          },
          data: { verifiedAt: new Date() },
        }),
      ),
    )

    return { saved: result.reduce((sum, r) => sum + r.count, 0) }
  })
