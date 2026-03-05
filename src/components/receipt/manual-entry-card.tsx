'use client'

import * as React from 'react'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'
import type {
  ManualEntryData,
  FieldSources,
  FieldSource,
  ReceiptFieldName,
  PaymentType,
  LineItem,
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

let lineItemCounter = 0
function generateLineItemId(): string {
  lineItemCounter += 1
  return `li-${Date.now()}-${lineItemCounter}`
}

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

function LineItemRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: LineItem
  onUpdate: (updated: LineItem) => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Product name"
        value={item.name}
        onChange={(e) => onUpdate({ ...item, name: e.target.value })}
        className="flex-1 text-sm h-8"
      />
      <Input
        type="number"
        step="1"
        min="1"
        placeholder="Qty"
        value={item.quantity}
        onChange={(e) => onUpdate({ ...item, quantity: e.target.value })}
        className="w-16 text-sm h-8"
      />
      <Input
        type="number"
        step="0.01"
        placeholder="Price"
        value={item.price}
        onChange={(e) => onUpdate({ ...item, price: e.target.value })}
        className="w-20 text-sm h-8"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span className="sr-only">Remove item</span>
      </Button>
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

  const addLineItem = React.useCallback(() => {
    const newItem: LineItem = {
      id: generateLineItemId(),
      name: '',
      quantity: '1',
      price: '',
    }
    onChange({ ...data, lineItems: [...data.lineItems, newItem] })
  }, [data, onChange])

  const updateLineItem = React.useCallback(
    (index: number, updated: LineItem) => {
      const items = [...data.lineItems]
      items[index] = updated
      onChange({ ...data, lineItems: items })
    },
    [data, onChange],
  )

  const removeLineItem = React.useCallback(
    (index: number) => {
      const items = data.lineItems.filter((_, i) => i !== index)
      onChange({ ...data, lineItems: items })
    },
    [data, onChange],
  )

  // Calculate line items total
  const lineItemsTotal = React.useMemo(() => {
    return data.lineItems.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0
      const price = parseFloat(item.price) || 0
      return sum + qty * price
    }, 0)
  }, [data.lineItems])

  return (
    <>
      <CardHeader className="pb-3">
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

        {/* Line Items / Products section */}
        <div className="border-t pt-4 mt-2 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">Products</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={addLineItem}
            >
              <Plus className="h-3 w-3" />
              Add item
            </Button>
          </div>

          {data.lineItems.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              No products added. Click &quot;Add item&quot; to add line items.
            </p>
          )}

          {data.lineItems.length > 0 && (
            <div className="space-y-2">
              {/* Column headers */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground px-0.5">
                <span className="flex-1">Name</span>
                <span className="w-16 text-center">Qty</span>
                <span className="w-20 text-center">Price</span>
                <span className="w-8" />
              </div>

              {data.lineItems.map((item, index) => (
                <LineItemRow
                  key={item.id}
                  item={item}
                  onUpdate={(updated) => updateLineItem(index, updated)}
                  onRemove={() => removeLineItem(index)}
                />
              ))}

              {/* Line items subtotal */}
              {lineItemsTotal > 0 && (
                <div className="flex justify-between items-center pt-2 border-t text-sm">
                  <span className="text-muted-foreground">Items subtotal</span>
                  <span className="font-medium">
                    {lineItemsTotal.toFixed(2)} RON
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </>
  )
}
