'use server'

import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { authActionClient } from '@/lib/safe-action'
import { prisma } from '@/lib/db'
import type { ExtractionResult, PaymentType } from '@/types/receipt'

const extractReceiptSchema = z.object({
  receiptId: z.string().min(1, 'Receipt ID is required'),
})

function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('AI extraction not configured')
  }
  return new Anthropic()
}

const EXTRACTION_PROMPT = `Extract these fields from the receipt image:
- vendorName: Store/vendor name
- totalAmount: Total amount as a number (in RON)
- receiptDate: Date in YYYY-MM-DD format
- taxAmount: Tax/VAT amount as a number (in RON)
- paymentType: 'cash', 'card', or 'other'
- confidence: Your confidence in the extraction from 0 to 1

Return JSON with these exact field names. Use null for any field you cannot determine.`

function isValidPaymentType(value: unknown): value is PaymentType {
  return value === 'cash' || value === 'card' || value === 'other'
}

function calculateConfidence(result: Record<string, unknown>): number {
  const fields = ['vendorName', 'totalAmount', 'receiptDate', 'taxAmount', 'paymentType']
  const extracted = fields.filter((f) => result[f] != null).length
  return Number((extracted / fields.length).toFixed(2))
}

export const extractReceipt = authActionClient
  .schema(extractReceiptSchema)
  .action(async ({ parsedInput: { receiptId }, ctx: { userId } }) => {
    // Verify receipt exists and belongs to user
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

    // Mark as processing
    await prisma.capturedReceipt.update({
      where: { id: receiptId },
      data: { extractionStatus: 'processing' },
    })

    try {
      const anthropic = getAnthropicClient()

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system:
          'You are a receipt data extractor. Analyze the receipt image and extract structured data. Return ONLY valid JSON, no other text.',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: receipt.mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                  data: receipt.imageData,
                },
              },
              {
                type: 'text',
                text: EXTRACTION_PROMPT,
              },
            ],
          },
        ],
      })

      // Extract text content from response
      const textBlock = response.content.find((block) => block.type === 'text')
      if (!textBlock || textBlock.type !== 'text') {
        throw new Error('No text in AI response')
      }

      // Parse JSON response
      let parsed: Record<string, unknown>
      try {
        parsed = JSON.parse(textBlock.text)
      } catch {
        // Set status to failed if we can't parse
        await prisma.capturedReceipt.update({
          where: { id: receiptId },
          data: {
            extractionStatus: 'failed',
            rawExtraction: { raw: textBlock.text, error: 'Failed to parse AI response' },
          },
        })
        return { status: 'failed' as const, error: 'Failed to parse AI response' }
      }

      // Map to ExtractionResult
      const confidence =
        typeof parsed.confidence === 'number' ? parsed.confidence : calculateConfidence(parsed)

      const extractionResult: ExtractionResult = {
        vendorName: typeof parsed.vendorName === 'string' ? parsed.vendorName : null,
        totalAmount: typeof parsed.totalAmount === 'number' ? parsed.totalAmount : null,
        receiptDate: typeof parsed.receiptDate === 'string' ? parsed.receiptDate : null,
        taxAmount: typeof parsed.taxAmount === 'number' ? parsed.taxAmount : null,
        paymentType: isValidPaymentType(parsed.paymentType) ? parsed.paymentType : null,
        confidence,
      }

      // Persist extraction results
      await prisma.capturedReceipt.update({
        where: { id: receiptId },
        data: {
          extractionStatus: 'completed',
          vendorName: extractionResult.vendorName,
          totalAmount: extractionResult.totalAmount,
          receiptDate: extractionResult.receiptDate ? new Date(extractionResult.receiptDate) : null,
          taxAmount: extractionResult.taxAmount,
          paymentType: extractionResult.paymentType,
          confidence: extractionResult.confidence,
          rawExtraction: JSON.parse(JSON.stringify(parsed)),
        },
      })

      return { status: 'success' as const, data: extractionResult }
    } catch (error) {
      // If it's already a "failed parse" return, re-throw
      if (error instanceof Error && error.message === 'AI extraction not configured') {
        throw error
      }

      // Mark as failed for API errors
      await prisma.capturedReceipt.update({
        where: { id: receiptId },
        data: {
          extractionStatus: 'failed',
          rawExtraction: {
            error: error instanceof Error ? error.message : 'Unknown extraction error',
          },
        },
      })

      return {
        status: 'failed' as const,
        error: error instanceof Error ? error.message : 'Extraction failed',
      }
    }
  })
