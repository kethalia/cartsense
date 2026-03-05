import type Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT =
  'You are a receipt data extraction specialist. You extract structured information from receipt images with complete precision. Read every line carefully before extracting.'

const USER_PROMPT = `
Extract all data from this receipt image and return it by calling the extract_receipt tool.

<receipt_image>
{{RECEIPT_IMAGE}}
</receipt_image>

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

After your analysis, call the extract_receipt tool with the extracted data. Your final output should consist ONLY of the tool call.`

const EXTRACT_RECEIPT_TOOL: Anthropic.Messages.Tool = {
  type: 'custom' as const,
  name: 'extract_receipt',
  description: 'Submit extracted receipt data',
  input_schema: {
    type: 'object' as const,
    properties: {
      merchant_name: {
        type: 'string',
        description: 'Exact store/business name from the receipt',
      },
      merchant_address: {
        type: 'string',
        description: 'Full address if present on the receipt',
      },
      transaction_date: {
        type: 'string',
        description: 'Date in YYYY-MM-DD format',
      },
      transaction_time: {
        type: 'string',
        description: 'Time of transaction if present',
      },
      receipt_number: {
        type: 'string',
        description: 'Receipt or transaction number if present',
      },
      items: {
        type: 'array',
        description: 'Every product/item on the receipt',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Item name exactly as shown',
            },
            quantity: {
              type: 'number',
              description: 'Quantity purchased',
            },
            unit_price: {
              type: 'number',
              description: 'Price per unit in RON',
            },
            total_price: {
              type: 'number',
              description: 'Line total (quantity × unit_price)',
            },
          },
          required: ['name', 'quantity', 'unit_price', 'total_price'],
        },
      },
      subtotal: {
        type: 'number',
        description: 'Subtotal before tax and adjustments',
      },
      tax: {
        type: 'number',
        description: 'Total tax/TVA amount in RON',
      },
      discounts: {
        type: 'number',
        description: 'Any discounts or adjustments applied',
      },
      total: {
        type: 'number',
        description: 'Final total amount in RON',
      },
      payment_method: {
        type: 'string',
        description: 'Payment method: cash, card, or other',
      },
      additional_info: {
        type: 'string',
        description: 'Any other relevant information from the receipt',
      },
    },
    required: ['merchant_name', 'transaction_date', 'items', 'total'],
  },
}

/** The structured result from the extract_receipt tool call */
export type ReceiptToolResult = {
  merchant_name: string
  merchant_address?: string
  transaction_date: string
  transaction_time?: string
  receipt_number?: string
  items: {
    name: string
    quantity: number
    unit_price: number
    total_price: number
  }[]
  subtotal?: number
  tax?: number
  discounts?: number
  total: number
  payment_method?: string
  additional_info?: string
}

/**
 * Build the Anthropic API request params for receipt extraction.
 * Pass the returned object directly to `anthropic.messages.create()`.
 */
export function buildReceiptExtractionRequest(
  imageBase64: string,
  mimeType: string,
  model: string,
): Anthropic.Messages.MessageCreateParamsNonStreaming {
  return {
    model,
    max_tokens: 20000,
    temperature: 0,
    system: SYSTEM_PROMPT,
    tools: [EXTRACT_RECEIPT_TOOL],
    tool_choice: { type: 'tool', name: 'extract_receipt' },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType as
                | 'image/jpeg'
                | 'image/png'
                | 'image/gif'
                | 'image/webp',
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: USER_PROMPT,
          },
        ],
      },
    ],
  }
}
