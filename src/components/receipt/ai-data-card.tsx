'use client'

import * as React from 'react'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type {
  ExtractionResult,
  FieldSources,
  FieldSource,
  ReceiptFieldName,
  PaymentType,
} from '@/types/receipt'
import { RECEIPT_FIELDS } from '@/types/receipt'
import { cn } from '@/lib/utils'

type AIDataCardProps = {
  data: ExtractionResult | null
  fieldSources: FieldSources
  onToggleSource: (field: ReceiptFieldName, source: FieldSource) => void
  loading?: boolean
}

const FIELD_LABELS: Record<ReceiptFieldName, string> = {
  vendorName: 'Vendor',
  totalAmount: 'Total',
  receiptDate: 'Date',
  taxAmount: 'Tax',
  paymentType: 'Payment',
}

function formatFieldValue(field: ReceiptFieldName, value: string | number | PaymentType | null): string {
  if (value === null || value === undefined) return '\u2014'

  switch (field) {
    case 'totalAmount':
    case 'taxAmount':
      return `${Number(value).toFixed(2)} RON`
    case 'paymentType':
      return String(value).charAt(0).toUpperCase() + String(value).slice(1)
    case 'receiptDate':
      return String(value)
    default:
      return String(value)
  }
}

export function AIDataCard({ data, fieldSources, onToggleSource, loading }: AIDataCardProps) {
  if (loading || !data) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-base">AI Extracted</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {RECEIPT_FIELDS.map((field) => (
            <div key={field} className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
          ))}
        </CardContent>
      </>
    )
  }

  return (
    <>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">AI Extracted</CardTitle>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            data.confidence >= 0.8
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : data.confidence >= 0.5
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
          )}
        >
          {Math.round(data.confidence * 100)}%
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        {RECEIPT_FIELDS.map((field) => {
          const value = data[field]
          const isSelected = fieldSources[field] === 'ai'

          return (
            <div key={field} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-20 shrink-0">
                {FIELD_LABELS[field]}
              </span>
              <span className="text-sm flex-1 truncate">
                {formatFieldValue(field, value)}
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSource(field, 'ai')}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <span className="sr-only">Use AI value for {FIELD_LABELS[field]}</span>
              </label>
            </div>
          )
        })}
      </CardContent>
    </>
  )
}
