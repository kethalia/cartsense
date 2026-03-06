'use client'

import * as React from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations, useFormatter } from 'next-intl'
import { Expand, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageViewer } from '@/components/receipt/image-viewer'
import { cn } from '@/lib/utils'
import type { PaymentType } from '@/types/receipt'

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
  confidence: number | null
  capturedAt: Date
  verifiedAt: Date | null
  lineItems: ReceiptLineItem[]
}

export function ReceiptDetails({
  id,
  imageData,
  mimeType,
  vendorName,
  totalAmount,
  receiptDate,
  taxAmount,
  paymentType,
  confidence,
  capturedAt,
  verifiedAt,
  lineItems,
}: ReceiptDetailsProps) {
  const t = useTranslations('Receipt')
  const format = useFormatter()
  const [viewerOpen, setViewerOpen] = React.useState(false)
  const dataUri = `data:${mimeType};base64,${imageData}`

  const formatDate = (date: Date) =>
    format.dateTime(date, { year: 'numeric', month: 'short', day: 'numeric' })

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

        {/* Details */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('receiptDetails')}</h2>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link href={`/receipt/${id}/verify`}>
                <Pencil className="h-3.5 w-3.5" />
                {t('edit')}
              </Link>
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
