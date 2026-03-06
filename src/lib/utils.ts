import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  receiptToolResultSchema,
  extractedLineItemSchema,
  type ExtractedLineItem,
  type ReceiptToolResult,
} from '@/schemas'

// ── General ──

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format bytes into a human-readable string (e.g. 1.2 MB). */
export function formatFileSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Trigger a browser download for a base64-encoded image. */
export function downloadImage(imageData: string, mimeType: string) {
  const ext = mimeType.split('/')[1] || 'jpg'
  const link = document.createElement('a')
  link.href = `data:${mimeType};base64,${imageData}`
  link.download = `receipt.${ext}`
  link.click()
}

// ── Receipt parsing ──
//
// Two rawExtraction storage formats exist:
//   1. Verified: { verified: true, lineItems: [{ name, quantity, unitPrice, totalPrice }] }
//   2. Raw AI:   { items: [{ name, quantity, unit_price, total_price }] }

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
