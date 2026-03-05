'use client'

import * as React from 'react'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type {
  ManualEntryData,
  FieldSources,
  FieldSource,
  ReceiptFieldName,
  PaymentType,
} from '@/types/receipt'

type ManualEntryCardProps = {
  data: ManualEntryData
  onChange: (data: ManualEntryData) => void
  fieldSources: FieldSources
  onToggleSource: (field: ReceiptFieldName, source: FieldSource) => void
  errors: Record<string, string>
}

const PAYMENT_OPTIONS: { value: PaymentType; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'other', label: 'Other' },
]

function FieldRow({
  label,
  required,
  field,
  fieldSources,
  onToggleSource,
  error,
  children,
}: {
  label: string
  required?: boolean
  field: ReceiptFieldName
  fieldSources: FieldSources
  onToggleSource: (field: ReceiptFieldName, source: FieldSource) => void
  error?: string
  children: React.ReactNode
}) {
  const isSelected = fieldSources[field] === 'manual'

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground w-20 shrink-0">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
        <div className="flex-1">{children}</div>
        <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSource(field, 'manual')}
            className="h-4 w-4 rounded border-input accent-primary"
          />
          <span className="sr-only">Use manual value for {label}</span>
        </label>
      </div>
      {error && (
        <p className="text-sm text-destructive ml-[calc(5rem+0.75rem)]">{error}</p>
      )}
    </div>
  )
}

export function ManualEntryCard({
  data,
  onChange,
  fieldSources,
  onToggleSource,
  errors,
}: ManualEntryCardProps) {
  const updateField = React.useCallback(
    <K extends keyof ManualEntryData>(field: K, value: ManualEntryData[K]) => {
      onChange({ ...data, [field]: value })
    },
    [data, onChange],
  )

  return (
    <>
      <CardHeader>
        <CardTitle className="text-base">Manual Entry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vendor Name */}
        <FieldRow
          label="Vendor"
          required
          field="vendorName"
          fieldSources={fieldSources}
          onToggleSource={onToggleSource}
          error={errors.vendorName}
        >
          <Input
            placeholder="e.g. Kaufland"
            value={data.vendorName}
            onChange={(e) => updateField('vendorName', e.target.value)}
          />
        </FieldRow>

        {/* Total Amount */}
        <FieldRow
          label="Total"
          required
          field="totalAmount"
          fieldSources={fieldSources}
          onToggleSource={onToggleSource}
          error={errors.totalAmount}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground shrink-0">RON</span>
            <Input
              type="number"
              step="0.01"
              placeholder="e.g. 125.50"
              value={data.totalAmount}
              onChange={(e) => updateField('totalAmount', e.target.value)}
            />
          </div>
        </FieldRow>

        {/* Date */}
        <FieldRow
          label="Date"
          field="receiptDate"
          fieldSources={fieldSources}
          onToggleSource={onToggleSource}
        >
          <Input
            type="date"
            value={data.receiptDate}
            onChange={(e) => updateField('receiptDate', e.target.value)}
          />
        </FieldRow>

        {/* Tax Amount */}
        <FieldRow
          label="Tax"
          field="taxAmount"
          fieldSources={fieldSources}
          onToggleSource={onToggleSource}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground shrink-0">RON</span>
            <Input
              type="number"
              step="0.01"
              placeholder="e.g. 23.81"
              value={data.taxAmount}
              onChange={(e) => updateField('taxAmount', e.target.value)}
            />
          </div>
        </FieldRow>

        {/* Payment Type */}
        <FieldRow
          label="Payment"
          field="paymentType"
          fieldSources={fieldSources}
          onToggleSource={onToggleSource}
        >
          <div className="flex gap-2">
            {PAYMENT_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                size="sm"
                variant={data.paymentType === opt.value ? 'default' : 'outline'}
                onClick={() => updateField('paymentType', opt.value)}
                className={cn(
                  'flex-1',
                  data.paymentType === opt.value && 'pointer-events-none',
                )}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </FieldRow>
      </CardContent>
    </>
  )
}
