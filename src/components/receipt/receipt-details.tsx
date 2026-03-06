'use client'

import * as React from 'react'
import { useTranslations, useFormatter } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { Expand, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageViewer } from '@/components/receipt/image-viewer'
import { ReceiptEditor } from '@/components/receipt/receipt-editor'
import { saveVerifiedReceipt } from '@/actions/save-verified-receipt'
import type { PaymentType, VerifiedReceiptData, ReceiptFormData } from '@/schemas'

type ReceiptLineItem = {
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

type ReceiptDetailsProps = {
  id: string
  imageData: string
  mimeType: string
  vendorName: string | null
  totalAmount: number | null
  receiptDate: Date | null
  taxAmount: number | null
  paymentType: string | null
  capturedAt: Date
  verifiedAt: Date | null
  lineItems: ReceiptLineItem[]
}

/** Convert numeric props into the string-based form format ReceiptEditor expects */
function toFormData(props: ReceiptDetailsProps): ReceiptFormData {
  return {
    vendorName: props.vendorName ?? '',
    totalAmount: props.totalAmount != null ? String(props.totalAmount) : '',
    receiptDate: props.receiptDate
      ? props.receiptDate.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    taxAmount: props.taxAmount != null ? String(props.taxAmount) : '',
    paymentType: (props.paymentType as 'cash' | 'card' | 'other') ?? '',
    lineItems: props.lineItems.map((i) => ({
      id: `d-${Math.random().toString(36).slice(2, 8)}`,
      name: i.name,
      quantity: String(i.quantity),
      unitPrice: String(i.unitPrice),
    })),
  }
}

export function ReceiptDetails(props: ReceiptDetailsProps) {
  const {
    id,
    imageData,
    mimeType,
    capturedAt,
  } = props

  const t = useTranslations('Receipt')
  const tCommon = useTranslations('Common')
  const format = useFormatter()

  const [isEditing, setIsEditing] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [viewerOpen, setViewerOpen] = React.useState(false)

  // Mutable local state so read-only view updates after save
  const [vendorName, setVendorName] = React.useState(props.vendorName)
  const [totalAmount, setTotalAmount] = React.useState(props.totalAmount)
  const [receiptDate, setReceiptDate] = React.useState(props.receiptDate)
  const [taxAmount, setTaxAmount] = React.useState(props.taxAmount)
  const [paymentType, setPaymentType] = React.useState(props.paymentType)
  const [verifiedAt, setVerifiedAt] = React.useState(props.verifiedAt)
  const [lineItems, setLineItems] = React.useState(props.lineItems)

  const saveAction = useAction(saveVerifiedReceipt)
  const dataUri = `data:${mimeType};base64,${imageData}`

  const formatDate = (date: Date) =>
    format.dateTime(date, { year: 'numeric', month: 'short', day: 'numeric' })

  const handleSave = React.useCallback(
    async (data: VerifiedReceiptData) => {
      setSaving(true)
      try {
        const result = await saveAction.executeAsync({
          receiptId: id,
          ...data,
        })

        if (result?.data) {
          // Update local state with saved values
          setVendorName(data.vendorName)
          setTotalAmount(data.totalAmount)
          setReceiptDate(data.receiptDate ? new Date(data.receiptDate) : null)
          setTaxAmount(data.taxAmount)
          setPaymentType(data.paymentType)
          setVerifiedAt(result.data.verifiedAt ? new Date(result.data.verifiedAt) : new Date())
          setLineItems(
            data.lineItems.map((i) => ({
              name: i.name,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              totalPrice: i.totalPrice,
            }))
          )

          toast.success(t('receiptVerified'))
          setIsEditing(false)
        } else {
          toast.error(t('saveFailed'))
        }
      } catch {
        toast.error(t('saveFailed'))
      } finally {
        setSaving(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, t]
  )

  // ── Edit mode: render ReceiptEditor inline ──
  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('receiptDetails')}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(false)}
          >
            {tCommon('cancel')}
          </Button>
        </div>
        <ReceiptEditor
          mode="edit"
          initialData={toFormData({
            ...props,
            vendorName,
            totalAmount,
            receiptDate,
            taxAmount,
            paymentType,
            verifiedAt,
            lineItems,
          })}
          imageData={imageData}
          mimeType={mimeType}
          onSave={handleSave}
          saving={saving}
        />
      </div>
    )
  }

  // ── Read-only mode ──
  const itemsSubtotal = lineItems.reduce((sum, i) => sum + i.totalPrice, 0)

  return (
    <div className="space-y-6">
      {/* ── Top: Image + Details side by side ── */}
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
        {/* Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dataUri}
            alt={t('receiptImage')}
            className="absolute inset-0 w-full h-full object-cover"
          />
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
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('receiptDetails')}</h2>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
              {t('edit')}
            </Button>
          </div>

          <dl className="space-y-3 flex-1">
            <DetailRow label={t('vendorName')} value={vendorName} />
            <DetailRow
              label={t('totalAmount')}
              value={totalAmount != null ? `${Number(totalAmount).toFixed(2)} RON` : null}
            />
            <DetailRow
              label={t('receiptDate')}
              value={receiptDate ? formatDate(receiptDate) : null}
            />
            <DetailRow
              label={t('taxAmount')}
              value={taxAmount != null ? `${Number(taxAmount).toFixed(2)} RON` : null}
            />
            <DetailRow
              label={t('paymentType')}
              value={paymentType ? t(paymentType as PaymentType) : null}
            />
            <DetailRow
              label={t('capturedOn')}
              value={formatDate(capturedAt)}
            />
            {verifiedAt && (
              <DetailRow
                label={t('verifiedOn')}
                value={formatDate(verifiedAt)}
              />
            )}
          </dl>
        </div>
      </div>

      {/* ── Products table ── */}
      {lineItems.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            {t('products')} ({lineItems.length})
          </h2>

          {/* Header */}
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-0.5 pb-2 border-b">
            <span className="flex-1">{t('productName')}</span>
            <span className="w-16 text-center">{t('qty')}</span>
            <span className="w-24 text-right">{t('unitPrice')}</span>
            <span className="w-24 text-right">{t('lineTotal')}</span>
          </div>

          {/* Rows */}
          <div className="divide-y">
            {lineItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 py-2 px-0.5 text-sm">
                <span className="flex-1 truncate">{item.name}</span>
                <span className="w-16 text-center tabular-nums">{item.quantity}</span>
                <span className="w-24 text-right tabular-nums">{item.unitPrice.toFixed(2)}</span>
                <span className="w-24 text-right tabular-nums font-medium">{item.totalPrice.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Subtotal */}
          {itemsSubtotal > 0 && (
            <div className="flex justify-end items-center gap-2 pt-3 border-t text-sm">
              <span className="text-muted-foreground">{t('itemsSubtotal')}</span>
              <span className="font-medium tabular-nums w-24 text-right">
                {itemsSubtotal.toFixed(2)} RON
              </span>
            </div>
          )}
        </div>
      )}

      <ImageViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        src={dataUri}
        alt={t('receiptImage')}
      />
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="text-sm text-muted-foreground w-28 shrink-0">{label}</dt>
      <dd className="text-sm font-medium">{value ?? '—'}</dd>
    </div>
  )
}
