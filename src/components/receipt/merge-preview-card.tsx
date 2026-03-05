'use client'

import * as React from 'react'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type {
  VerifiedReceiptData,
  FieldSources,
  ReceiptFieldName,
  PaymentType,
} from '@/types/receipt'
import { RECEIPT_FIELDS } from '@/types/receipt'

type MergePreviewCardProps = {
  mergedData: VerifiedReceiptData | null
  fieldSources: FieldSources
  isValid: boolean
}

const FIELD_LABELS: Record<ReceiptFieldName, string> = {
  vendorName: 'Vendor',
  totalAmount: 'Total',
  receiptDate: 'Date',
  taxAmount: 'Tax',
  paymentType: 'Payment',
}

function formatPreviewValue(
  field: ReceiptFieldName,
  data: VerifiedReceiptData,
): string {
  const value = data[field]
  if (value === null || value === undefined || value === '') return '\u2014'

  switch (field) {
    case 'totalAmount':
    case 'taxAmount':
      return `${Number(value).toFixed(2)} RON`
    case 'paymentType':
      return String(value).charAt(0).toUpperCase() + String(value).slice(1)
    default:
      return String(value)
  }
}

function SourceBadge({ source }: { source: 'ai' | 'manual' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none',
        source === 'ai'
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      )}
    >
      {source === 'ai' ? 'AI' : 'Manual'}
    </span>
  )
}

export function MergePreviewCard({
  mergedData,
  fieldSources,
  isValid,
}: MergePreviewCardProps) {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-base">Merge Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isValid && (
          <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 px-3 py-2 text-sm text-yellow-800 dark:text-yellow-300">
            Required fields missing — fill in vendor name and total amount
          </div>
        )}

        {RECEIPT_FIELDS.map((field) => {
          const displayValue = mergedData
            ? formatPreviewValue(field, mergedData)
            : '\u2014'
          const isEmpty = displayValue === '\u2014'

          return (
            <div key={field} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-20 shrink-0">
                {FIELD_LABELS[field]}
              </span>
              <span
                className={cn(
                  'text-sm flex-1 truncate',
                  isEmpty && 'text-muted-foreground',
                )}
              >
                {displayValue}
              </span>
              <SourceBadge source={fieldSources[field]} />
            </div>
          )
        })}
      </CardContent>
    </>
  )
}
