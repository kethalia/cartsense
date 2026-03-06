'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Trash2, Merge, Expand } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ImageViewer } from '@/components/receipt/image-viewer'
import { cn } from '@/lib/utils'
import type {
  ExtractionResult,
  ReceiptFormData,
  VerifiedReceiptData,
  LineItem,
  PaymentType,
} from '@/schemas'

// ── Helpers ──

let _counter = 0
function generateId(): string {
  _counter += 1
  return `li-${Date.now()}-${_counter}`
}

function extractionToForm(ai: ExtractionResult): ReceiptFormData {
  return {
    vendorName: ai.vendorName ?? '',
    totalAmount: ai.totalAmount !== null ? String(ai.totalAmount) : '',
    receiptDate: ai.receiptDate ?? new Date().toISOString().split('T')[0],
    taxAmount: ai.taxAmount !== null ? String(ai.taxAmount) : '',
    paymentType: ai.paymentType ?? '',
    lineItems: ai.lineItems.map((item) => ({
      id: generateId(),
      name: item.name,
      quantity: String(item.quantity),
      unitPrice: String(item.unitPrice),
    })),
  }
}

function emptyForm(): ReceiptFormData {
  return {
    vendorName: '',
    totalAmount: '',
    receiptDate: new Date().toISOString().split('T')[0],
    taxAmount: '',
    paymentType: '',
    lineItems: [],
  }
}

function formDataToForm(data: ReceiptFormData): ReceiptFormData {
  return {
    ...data,
    lineItems: data.lineItems.map((item) => ({
      ...item,
      id: item.id || generateId(),
    })),
  }
}

/** Combine items with the same name (case-insensitive) → sum quantities, keep unit price from first */
function combineLineItems(items: LineItem[]): LineItem[] {
  const map = new Map<string, LineItem>()

  for (const item of items) {
    const key = item.name.trim().toLowerCase()
    if (!key) continue

    const existing = map.get(key)
    if (existing) {
      const existingQty = parseFloat(existing.quantity) || 0
      const addQty = parseFloat(item.quantity) || 0
      map.set(key, { ...existing, quantity: String(existingQty + addQty) })
    } else {
      map.set(key, { ...item })
    }
  }

  return Array.from(map.values())
}

// ── Sub-components ──

const PAYMENT_OPTIONS: { value: PaymentType; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'other', label: 'Other' },
]

function ProductRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: LineItem
  onUpdate: (updated: LineItem) => void
  onRemove: () => void
}) {
  const lineTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)

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
        min="0"
        placeholder="Qty"
        value={item.quantity}
        onChange={(e) => onUpdate({ ...item, quantity: e.target.value })}
        className="w-16 text-sm h-8 text-center"
      />
      <Input
        type="number"
        step="0.01"
        min="0"
        placeholder="Price"
        value={item.unitPrice}
        onChange={(e) => onUpdate({ ...item, unitPrice: e.target.value })}
        className="w-20 text-sm h-8 text-right"
      />
      <span className="w-20 text-sm text-right text-muted-foreground tabular-nums shrink-0">
        {lineTotal > 0 ? `${lineTotal.toFixed(2)}` : '—'}
      </span>
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

// ── Main Component ──

export type ReceiptEditorMode = 'verify' | 'edit'

type ReceiptEditorProps = {
  /** 'verify' = first-time after AI extraction, 'edit' = editing existing receipt */
  mode?: ReceiptEditorMode
  /** AI extraction result (verify mode) */
  aiData?: ExtractionResult | null
  /** Pre-filled form data (edit mode) */
  initialData?: ReceiptFormData | null
  imageData: string
  mimeType: string
  onSave: (data: VerifiedReceiptData) => void
  saving?: boolean
}

export function ReceiptEditor({
  mode = 'verify',
  aiData,
  initialData,
  imageData,
  mimeType,
  onSave,
  saving,
}: ReceiptEditorProps) {
  const t = useTranslations('Receipt')

  const [form, setForm] = React.useState<ReceiptFormData>(() => {
    if (initialData) return formDataToForm(initialData)
    if (aiData) return extractionToForm(aiData)
    return emptyForm()
  })

  // Validation
  const errors = React.useMemo(() => {
    const e: Record<string, string> = {}
    if (!form.vendorName.trim()) e.vendorName = t('vendorRequired')
    const total = parseFloat(form.totalAmount)
    if (!form.totalAmount || isNaN(total) || total <= 0) e.totalAmount = t('amountRequired')
    return e
  }, [form.vendorName, form.totalAmount, t])

  const isValid = Object.keys(errors).length === 0

  // Field updater
  const updateField = React.useCallback(
    <K extends keyof ReceiptFormData>(field: K, value: ReceiptFormData[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  // Line item ops
  const addLineItem = React.useCallback(() => {
    setForm((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, { id: generateId(), name: '', quantity: '1', unitPrice: '' }],
    }))
  }, [])

  const updateLineItem = React.useCallback((index: number, updated: LineItem) => {
    setForm((prev) => {
      const items = [...prev.lineItems]
      items[index] = updated
      return { ...prev, lineItems: items }
    })
  }, [])

  const removeLineItem = React.useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }))
  }, [])

  const handleCombineDuplicates = React.useCallback(() => {
    setForm((prev) => ({ ...prev, lineItems: combineLineItems(prev.lineItems) }))
  }, [])

  // Computed
  const itemsSubtotal = React.useMemo(
    () =>
      form.lineItems.reduce(
        (sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0),
        0
      ),
    [form.lineItems]
  )

  const hasDuplicates = React.useMemo(() => {
    const names = form.lineItems.map((i) => i.name.trim().toLowerCase()).filter(Boolean)
    return new Set(names).size < names.length
  }, [form.lineItems])

  // Save handler
  const handleSave = React.useCallback(() => {
    if (!isValid) return

    const totalAmount = parseFloat(form.totalAmount)
    const taxAmount = form.taxAmount ? parseFloat(form.taxAmount) : null
    const paymentType = form.paymentType || null

    const lineItems = form.lineItems
      .filter((i) => i.name.trim())
      .map((i) => {
        const qty = parseFloat(i.quantity) || 1
        const price = parseFloat(i.unitPrice) || 0
        return { name: i.name.trim(), quantity: qty, unitPrice: price, totalPrice: qty * price }
      })

    onSave({
      vendorName: form.vendorName.trim(),
      totalAmount,
      receiptDate: form.receiptDate || null,
      taxAmount,
      paymentType,
      lineItems,
    })
  }, [form, isValid, onSave])

  const confidence = aiData?.confidence
  const [viewerOpen, setViewerOpen] = React.useState(false)
  const dataUri = `data:${mimeType};base64,${imageData}`

  return (
    <div className="space-y-6">
      {/* ── Top: Image + Form side by side (desktop), stacked (mobile) ── */}
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
        {/* Image — aspect-square, fixed width on desktop */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dataUri}
            alt={t('receiptImage')}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Expand button */}
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/95 shadow-sm"
            onClick={() => setViewerOpen(true)}
          >
            <Expand className="h-4 w-4" />
            <span className="sr-only">{t('viewFullImage')}</span>
          </Button>
          {/* Confidence badge */}
          {confidence != null && (
            <div className="absolute bottom-2 left-2">
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shadow-sm',
                  confidence >= 0.8
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : confidence >= 0.5
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                )}
              >
                {t('confidence', { value: Math.round(confidence * 100) })}
              </span>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold mb-4">{t('receiptDetails')}</h2>

          <div className="space-y-4 flex-1">
            {/* Vendor Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                {t('vendorName')} <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder={t('vendorPlaceholder')}
                value={form.vendorName}
                onChange={(e) => updateField('vendorName', e.target.value)}
              />
              {errors.vendorName && (
                <p className="text-sm text-destructive">{errors.vendorName}</p>
              )}
            </div>

            {/* Total Amount */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                {t('totalAmount')} <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">RON</span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={t('amountPlaceholder')}
                  value={form.totalAmount}
                  onChange={(e) => updateField('totalAmount', e.target.value)}
                />
              </div>
              {errors.totalAmount && (
                <p className="text-sm text-destructive">{errors.totalAmount}</p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('receiptDate')}</label>
              <Input
                type="date"
                value={form.receiptDate}
                onChange={(e) => updateField('receiptDate', e.target.value)}
              />
            </div>

            {/* Tax */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('taxAmount')}</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">RON</span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={t('taxPlaceholder')}
                  value={form.taxAmount}
                  onChange={(e) => updateField('taxAmount', e.target.value)}
                />
              </div>
            </div>

            {/* Payment Type */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('paymentType')}</label>
              <div className="flex gap-2">
                {PAYMENT_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    size="sm"
                    variant={form.paymentType === opt.value ? 'default' : 'outline'}
                    onClick={() => updateField('paymentType', opt.value)}
                    className="flex-1"
                  >
                    {t(opt.value)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom: Full-width products table ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">
            {t('products')} ({form.lineItems.length})
          </h2>
          <div className="flex gap-2">
            {hasDuplicates && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={handleCombineDuplicates}
              >
                <Merge className="h-3 w-3" />
                {t('combineDuplicates')}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={addLineItem}
            >
              <Plus className="h-3 w-3" />
              {t('addItem')}
            </Button>
          </div>
        </div>

        {form.lineItems.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-4">
            {t('noProducts')}
          </p>
        ) : (
          <div className="space-y-2">
            {/* Column headers */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-0.5">
              <span className="flex-1">{t('productName')}</span>
              <span className="w-16 text-center">{t('qty')}</span>
              <span className="w-20 text-right">{t('unitPrice')}</span>
              <span className="w-20 text-right">{t('lineTotal')}</span>
              <span className="w-8" />
            </div>

            {form.lineItems.map((item, index) => (
              <ProductRow
                key={item.id}
                item={item}
                onUpdate={(updated) => updateLineItem(index, updated)}
                onRemove={() => removeLineItem(index)}
              />
            ))}

            {/* Items subtotal */}
            {itemsSubtotal > 0 && (
              <div className="flex justify-end items-center gap-2 pt-3 border-t text-sm">
                <span className="text-muted-foreground">{t('itemsSubtotal')}</span>
                <span className="font-medium tabular-nums w-20 text-right">
                  {itemsSubtotal.toFixed(2)} RON
                </span>
                <span className="w-8" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Save ── */}
      <Button
        size="lg"
        className="w-full sm:w-auto"
        disabled={!isValid || saving}
        onClick={handleSave}
      >
        {saving ? t('saving') : mode === 'edit' ? t('updateReceipt') : t('saveReceipt')}
      </Button>

      {/* ── Image viewer modal ── */}
      <ImageViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        src={dataUri}
        alt={t('receiptImage')}
      />
    </div>
  )
}
