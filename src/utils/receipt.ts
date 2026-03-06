import {
  receiptToolResultSchema,
  extractedLineItemSchema,
  type ExtractedLineItem,
  type ReceiptToolResult,
} from '@/schemas'

/**
 * Shared utilities for parsing receipt data from the rawExtraction JSON field.
 *
 * Two storage formats exist:
 *   1. Verified: { verified: true, lineItems: [{ name, quantity, unitPrice, totalPrice }] }
 *   2. Raw AI:   { items: [{ name, quantity, unit_price, total_price }] }
 */

/** Re-export for convenience — same shape as ExtractedLineItem */
export type ParsedLineItem = ExtractedLineItem

/**
 * Extract line items from the `rawExtraction` JSON column.
 * Handles both verified (camelCase) and raw AI (snake_case) formats.
 * Uses Zod schemas for safe parsing instead of blind type casts.
 */
export function extractLineItems(raw: unknown): ParsedLineItem[] {
  if (!raw || typeof raw !== 'object') return []

  const obj = raw as Record<string, unknown>

  // Verified format: { verified: true, lineItems: [...] }
  if (obj.verified && Array.isArray(obj.lineItems)) {
    return obj.lineItems
      .map((i) => extractedLineItemSchema.safeParse(i))
      .filter((r) => r.success)
      .map((r) => r.data!)
  }

  // Raw AI format — validate with receiptToolResultSchema, then map
  const parsed = receiptToolResultSchema.safeParse(obj)
  if (parsed.success) {
    return mapToolItems(parsed.data)
  }

  // Loose fallback: if there's just an `items` array with snake_case fields
  if (Array.isArray(obj.items)) {
    return obj.items
      .map((i: Record<string, unknown>) =>
        extractedLineItemSchema.safeParse({
          name: i.name ?? '',
          quantity: i.quantity ?? 1,
          unitPrice: i.unit_price ?? 0,
          totalPrice: i.total_price ?? 0,
        }),
      )
      .filter((r) => r.success)
      .map((r) => r.data!)
  }

  return []
}

/**
 * Extract line items as string values — suitable for form inputs.
 * Returns `{ name, quantity: string, unitPrice: string }` (no totalPrice since
 * forms compute it from qty × price).
 */
export function extractLineItemsForForm(
  raw: unknown,
): { name: string; quantity: string; unitPrice: string }[] {
  return extractLineItems(raw).map((i) => ({
    name: i.name,
    quantity: String(i.quantity),
    unitPrice: String(i.unitPrice),
  }))
}

/** Map snake_case AI tool items → camelCase ExtractedLineItem[] */
export function mapToolItems(result: ReceiptToolResult): ExtractedLineItem[] {
  return (result.items ?? []).map((item) => ({
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    totalPrice: item.total_price,
  }))
}
