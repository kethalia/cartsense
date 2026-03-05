import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const SYSTEM_PROMPT =
  "You are a receipt data extraction specialist. You extract structured information from receipt images with complete precision. Read every line carefully before extracting.";

const USER_PROMPT = `
Extract all data from this receipt image and return it by calling the extract_receipt tool.

Before calling the tool, conduct a thorough analysis inside <receipt_analysis> tags:

**Step 1: Full Transcription**
Transcribe the entire receipt text line by line exactly as it appears in the image. Include every piece of text — header, item lines, footer, everything. It's OK for this to be long.

**Step 2: Basic Information**
Identify and explicitly label:
- Store/merchant name and location
- Transaction date and time
- Receipt/transaction number

**Step 3: Items List**
Create a numbered list of every single item on the receipt. Number each item sequentially (1., 2., 3., etc.) to ensure you don't miss any. For each item extract:
- Item name/description (exactly as shown)
- Quantity
- Unit price (price per item)
- Total price for that line item

**Step 4: Financial Summary**
Identify and label:
- Subtotal
- Tax/TVA amount(s)
- Any discounts or adjustments
- Final total (TOTAL or TOTAL DE PLATA)
- Payment method (NUMERAR=cash, CARD/POS/BANCOMAT=card)

**Step 5: Arithmetic Verification**
- Does each item's total = quantity × unit price? Verify at least 2-3 items.
- Does the sum of all item totals ≈ subtotal?
- Does subtotal + tax - discounts = final total?
If any calculations don't match, note the discrepancy.

**Step 6: Completeness Check**
- Count the total number of items you listed in Step 3
- Look back at the receipt image and count how many item lines you see
- Verify these numbers match

**Formatting rules:**
- Romanian receipts use comma as decimal separator (125,50 = 125.50) — convert to dot notation
- Convert dates from DD.MM.YYYY or DD/MM/YYYY to YYYY-MM-DD format
- All amounts should be numbers in RON

After your analysis, call the extract_receipt tool with the extracted data. Your final output should consist ONLY of the tool call.`;

const EXTRACT_RECEIPT_TOOL: Anthropic.Messages.Tool = {
  type: "custom",
  name: "extract_receipt",
  description: "Submit extracted receipt data",
  input_schema: {
    type: "object",
    properties: {
      merchant_name: {
        type: "string",
        description: "Exact store/business name from the receipt",
      },
      merchant_address: {
        type: "string",
        description: "Full address if present on the receipt",
      },
      transaction_date: {
        type: "string",
        description: "Date in YYYY-MM-DD format",
      },
      transaction_time: {
        type: "string",
        description: "Time of transaction if present",
      },
      receipt_number: {
        type: "string",
        description: "Receipt or transaction number if present",
      },
      items: {
        type: "array",
        description: "Every product/item on the receipt",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Item name exactly as shown",
            },
            quantity: {
              type: "number",
              description: "Quantity purchased",
            },
            unit_price: {
              type: "number",
              description: "Price per unit in RON",
            },
            total_price: {
              type: "number",
              description: "Line total (quantity × unit_price)",
            },
          },
          required: ["name", "quantity", "unit_price", "total_price"],
        },
      },
      subtotal: {
        type: "number",
        description: "Subtotal before tax and adjustments",
      },
      tax: {
        type: "number",
        description: "Total tax/TVA amount in RON",
      },
      discounts: {
        type: "number",
        description: "Any discounts or adjustments applied",
      },
      total: {
        type: "number",
        description: "Final total amount in RON",
      },
      payment_method: {
        type: "string",
        description: "Payment method: cash, card, or other",
      },
      additional_info: {
        type: "string",
        description: "Any other relevant information from the receipt",
      },
    },
    required: ["merchant_name", "transaction_date", "items", "total"],
  },
};

// ── Zod Schemas ──

export const imageMimeTypeSchema = z.enum([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

export type ImageMimeType = z.infer<typeof imageMimeTypeSchema>;

const receiptItemSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unit_price: z.number(),
  total_price: z.number(),
});

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
});

export type ReceiptToolResult = z.infer<typeof receiptToolResultSchema>;

/**
 * Build the Anthropic API request params for receipt extraction.
 * Pass the returned object directly to `anthropic.messages.create()`.
 */
export function buildReceiptExtractionRequest(
  imageBase64: string,
  mimeType: ImageMimeType,
): Anthropic.Messages.MessageCreateParamsNonStreaming {
  return {
    model: "claude-sonnet-4-6",
    max_tokens: 20000,
    temperature: 0,
    system: SYSTEM_PROMPT,
    tools: [EXTRACT_RECEIPT_TOOL],
    tool_choice: { type: "tool", name: "extract_receipt" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType,
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: USER_PROMPT,
          },
        ],
      },
    ],
  };
}
