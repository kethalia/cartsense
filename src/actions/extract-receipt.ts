'use server'

import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { authActionClient } from '@/lib/safe-action'
import { prisma } from '@/lib/db'
import {
  buildReceiptExtractionRequest,
  type ReceiptToolResult,
} from '@/lib/prompts/extract-receipt'
import type { ExtractionResult, ExtractedLineItem, PaymentType } from '@/types/receipt'

// ── AI Model Configuration ──
const AI_MODELS = {
  default: 'claude-sonnet-4-20250514',
} as const

function getExtractionModel(_userId: string): string {
  // Sonnet 4 — tested in Workbench, accurate for Romanian receipts.
  // Haiku 4.5 was tested but gives inaccurate totals and misses fields.
  return AI_MODELS.default
}

const extractReceiptSchema = z.object({
  receiptId: z.string().min(1, 'Receipt ID is required'),
})

function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('AI extraction not configured')
  }
  return new Anthropic()
}

function isValidPaymentType(value: unknown): value is PaymentType {
  return value === 'cash' || value === 'card' || value === 'other'
}

/** Map tool result to our ExtractionResult type */
function mapToolResult(result: ReceiptToolResult): ExtractionResult {
  const lineItems: ExtractedLineItem[] = (result.items ?? []).map((item) => ({
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    totalPrice: item.total_price,
  }))

  const fields = [
    result.merchant_name,
    result.total,
    result.transaction_date,
    result.tax,
    result.payment_method,
  ]
  const extracted = fields.filter((f) => f != null).length
  const confidence = Number((extracted / fields.length).toFixed(2))

  return {
    vendorName: result.merchant_name ?? null,
    totalAmount: result.total ?? null,
    receiptDate: result.transaction_date ?? null,
    taxAmount: result.tax ?? null,
    paymentType: isValidPaymentType(result.payment_method) ? result.payment_method : null,
    lineItems,
    confidence,
  }
}

export const extractReceipt = authActionClient
  .schema(extractReceiptSchema)
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
      throw new Error('Receipt not found')
    }

    await prisma.capturedReceipt.update({
      where: { id: receiptId },
      data: { extractionStatus: 'processing' },
    })

    const model = getExtractionModel(userId)

    try {
      const anthropic = getAnthropicClient()

      const params = buildReceiptExtractionRequest(
        receipt.imageData,
        receipt.mimeType,
        model,
      )

      const response = await anthropic.messages.create(params)

      // Find the tool_use block in the response
      const toolUseBlock = response.content.find(
        (block) => block.type === 'tool_use' && block.name === 'extract_receipt',
      )

      if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
        console.error('[extract-receipt] No tool_use block in response:', response.content)
        await prisma.capturedReceipt.update({
          where: { id: receiptId },
          data: {
            extractionStatus: 'failed',
            rawExtraction: { error: 'AI did not call the extraction tool' },
          },
        })
        return { status: 'failed' as const, error: 'AI did not return structured data' }
      }

      const toolResult = toolUseBlock.input as ReceiptToolResult
      const extractionResult = mapToolResult(toolResult)

      // Persist extraction results
      await prisma.capturedReceipt.update({
        where: { id: receiptId },
        data: {
          extractionStatus: 'completed',
          vendorName: extractionResult.vendorName,
          totalAmount: extractionResult.totalAmount,
          receiptDate: extractionResult.receiptDate
            ? new Date(extractionResult.receiptDate)
            : null,
          taxAmount: extractionResult.taxAmount,
          paymentType: extractionResult.paymentType,
          confidence: extractionResult.confidence,
          rawExtraction: JSON.parse(JSON.stringify(toolResult)),
        },
      })

      return { status: 'success' as const, data: extractionResult }
    } catch (error) {
      if (error instanceof Error && error.message === 'AI extraction not configured') {
        throw error
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown extraction error'
      console.error('[extract-receipt] AI extraction failed:', errorMessage, {
        receiptId,
        model,
        status: (error as { status?: number }).status,
      })

      await prisma.capturedReceipt.update({
        where: { id: receiptId },
        data: {
          extractionStatus: 'failed',
          rawExtraction: { error: errorMessage, model },
        },
      })

      return { status: 'failed' as const, error: errorMessage }
    }
  })
