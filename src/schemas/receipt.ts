import { z } from 'zod'

// ── Image ──

export const imageMimeTypeSchema = z.enum([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
])

export type ImageMimeType = z.infer<typeof imageMimeTypeSchema>

// ── AI tool output (snake_case — matches Claude tool schema) ──

export const receiptItemSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unit_price: z.number(),
  total_price: z.number(),
})

export const receiptToolResultSchema = z.object({
  merchant_name: z.string(),
  merchant_address: z.string().optional(),
  transaction_date: z.string(),
  transaction_time: z.string().optional(),
  receipt_number: z.string().optional(),
  items: z.array(receiptItemSchema),
  subtotal: z.number().optional(),
  tax: z.number().optional(),
  discounts: z.number().optional(),
  total: z.number(),
  payment_method: z.string().optional(),
  additional_info: z.string().optional(),
})

export type ReceiptToolResult = z.infer<typeof receiptToolResultSchema>

// ── Domain types ──

export const paymentTypeSchema = z.enum(['cash', 'card', 'other'])
export type PaymentType = z.infer<typeof paymentTypeSchema>

export const extractionStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed'])
export type ExtractionStatus = z.infer<typeof extractionStatusSchema>

// ── Extracted line item (camelCase — app-internal) ──

export const extractedLineItemSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  totalPrice: z.number(),
})

export type ExtractedLineItem = z.infer<typeof extractedLineItemSchema>

// ── Extraction result (returned by AI extraction action) ──

export const extractionResultSchema = z.object({
  vendorName: z.string().nullable(),
  totalAmount: z.number().nullable(),
  receiptDate: z.string().nullable(),
  taxAmount: z.number().nullable(),
  paymentType: paymentTypeSchema.nullable(),
  lineItems: z.array(extractedLineItemSchema),

})

export type ExtractionResult = z.infer<typeof extractionResultSchema>

// ── Editable line item (string values for form inputs) ──

export const lineItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.string(),
  unitPrice: z.string(),
})

export type LineItem = z.infer<typeof lineItemSchema>

// ── Receipt form data (editable form state) ──

export const receiptFormDataSchema = z.object({
  vendorName: z.string(),
  totalAmount: z.string(),
  receiptDate: z.string(),
  taxAmount: z.string(),
  paymentType: z.union([paymentTypeSchema, z.literal('')]),
  lineItems: z.array(lineItemSchema),
})

export type ReceiptFormData = z.infer<typeof receiptFormDataSchema>

// ── Verified receipt data (ready to persist) ──

export const verifiedLineItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
})

export const verifiedReceiptDataSchema = z.object({
  vendorName: z.string().min(1, 'Vendor name is required'),
  totalAmount: z.number().positive('Amount must be positive'),
  receiptDate: z.string().nullable(),
  taxAmount: z.number().min(0).nullable(),
  paymentType: paymentTypeSchema.nullable(),
  lineItems: z.array(verifiedLineItemSchema).default([]),
})

export type VerifiedReceiptData = z.infer<typeof verifiedReceiptDataSchema>

// ── Action input schemas ──

export const captureReceiptSchema = z.object({
  image: z
    .instanceof(File)
    .refine((f) => f.type.startsWith('image/'), 'Must be an image type')
    .refine((f) => f.size <= 10 * 1024 * 1024, 'File too large: maximum 10MB'),
})

export const extractReceiptSchema = z.object({
  receiptId: z.string().min(1, 'Receipt ID is required'),
})

export const saveVerifiedReceiptSchema = z.object({
  receiptId: z.string().min(1, 'Receipt ID is required'),
  ...verifiedReceiptDataSchema.shape,
})
