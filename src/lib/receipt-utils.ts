/**
 * Shared utilities for parsing receipt data from the rawExtraction JSON field.
 *
 * Two storage formats exist:
 *   1. Verified: { verified: true, lineItems: [{ name, quantity, unitPrice, totalPrice }] }
 *   2. Raw AI:   { items: [{ name, quantity, unit_price, total_price }] }
 */

export type ParsedLineItem = {
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

/**
 * Extract line items from the `rawExtraction` JSON column.
 * Handles both verified (camelCase) and raw AI (snake_case) formats.
 */
export function extractLineItems(raw: unknown): ParsedLineItem[] {
  if (!raw || typeof raw !== 'object') return []

  const obj = raw as Record<string, unknown>

  // Verified format: { verified: true, lineItems: [...] }
  if (obj.verified && Array.isArray(obj.lineItems)) {
    return (
      obj.lineItems as {
        name: string
        quantity: number
        unitPrice: number
        totalPrice: number
      }[]
    ).map((i) => ({
      name: i.name ?? '',
      quantity: i.quantity ?? 1,
      unitPrice: i.unitPrice ?? 0,
      totalPrice: i.totalPrice ?? 0,
    }))
  }

  // Raw AI format: { items: [{ name, quantity, unit_price, total_price }] }
  if (Array.isArray(obj.items)) {
    return (
      obj.items as {
        name: string
        quantity: number
        unit_price: number
        total_price: number
      }[]
    ).map((i) => ({
      name: i.name ?? '',
      quantity: i.quantity ?? 1,
      unitPrice: i.unit_price ?? 0,
      totalPrice: i.total_price ?? 0,
    }))
  }

  return []
}

/**
 * Extract line items as string values — suitable for form inputs.
 * Returns `{ name, quantity: string, unitPrice: string }` (no totalPrice since
 * forms compute it from qty × price).
 */
export function extractLineItemsForForm(
  raw: unknown
): { name: string; quantity: string; unitPrice: string }[] {
  return extractLineItems(raw).map((i) => ({
    name: i.name,
    quantity: String(i.quantity),
    unitPrice: String(i.unitPrice),
  }))
}
