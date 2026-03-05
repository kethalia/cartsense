/** Status of AI extraction for a receipt */
export type ExtractionStatus = 'pending' | 'processing' | 'completed' | 'failed'

/** Payment type options */
export type PaymentType = 'cash' | 'card' | 'other'

/** Result from AI extraction — returned by extractReceipt action */
export type ExtractionResult = {
  vendorName: string | null
  totalAmount: number | null
  receiptDate: string | null // ISO date string (YYYY-MM-DD)
  taxAmount: number | null
  paymentType: PaymentType | null
  confidence: number // 0-1 overall confidence
}

/** Field names available for source selection in verification UI */
export type ReceiptFieldName = 'vendorName' | 'totalAmount' | 'receiptDate' | 'taxAmount' | 'paymentType'

/** Source of field data — used in merge logic */
export type FieldSource = 'manual' | 'ai'

/** Map of each field to its selected source */
export type FieldSources = Record<ReceiptFieldName, FieldSource>

/** A single product/line item on a receipt */
export type LineItem = {
  id: string
  name: string
  quantity: string // string for input field
  price: string // string for input field (unit price)
}

/** Manual entry form data — string types for form inputs */
export type ManualEntryData = {
  vendorName: string
  totalAmount: string // string for input field, parsed to number on save
  receiptDate: string // YYYY-MM-DD format
  taxAmount: string
  paymentType: PaymentType | ''
  lineItems: LineItem[]
}

/** Verified receipt data ready to persist */
export type VerifiedReceiptData = {
  vendorName: string
  totalAmount: number
  receiptDate: string | null // ISO date string, null if not provided
  taxAmount: number | null
  paymentType: PaymentType | null
}

/** All 5 receipt field labels — for iteration in UI */
export const RECEIPT_FIELDS: readonly ReceiptFieldName[] = [
  'vendorName',
  'totalAmount',
  'receiptDate',
  'taxAmount',
  'paymentType',
] as const
