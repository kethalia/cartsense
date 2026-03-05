/** Status of AI extraction for a receipt */
export type ExtractionStatus = 'pending' | 'processing' | 'completed' | 'failed'

/** Payment type options */
export type PaymentType = 'cash' | 'card' | 'other'

/** A product/line item extracted by AI */
export type ExtractedLineItem = {
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

/** Result from AI extraction — returned by extractReceipt action */
export type ExtractionResult = {
  vendorName: string | null
  totalAmount: number | null
  receiptDate: string | null // ISO date string (YYYY-MM-DD)
  taxAmount: number | null
  paymentType: PaymentType | null
  lineItems: ExtractedLineItem[]
  confidence: number // 0-1 overall confidence
}

/** A single editable product line item */
export type LineItem = {
  id: string
  name: string
  quantity: string // string for input field
  unitPrice: string // string for input field
}

/** Receipt form data — all fields editable after AI extraction */
export type ReceiptFormData = {
  vendorName: string
  totalAmount: string
  receiptDate: string // YYYY-MM-DD
  taxAmount: string
  paymentType: PaymentType | ''
  lineItems: LineItem[]
}

/** Verified receipt data ready to persist (including line items) */
export type VerifiedReceiptData = {
  vendorName: string
  totalAmount: number
  receiptDate: string | null
  taxAmount: number | null
  paymentType: PaymentType | null
  lineItems: { name: string; quantity: number; unitPrice: number; totalPrice: number }[]
}
