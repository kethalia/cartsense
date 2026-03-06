"use client"

import { Expand, Pencil } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import * as React from "react"
import { ImageViewer } from "@/components/receipt/image-viewer"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Link } from "@/i18n/navigation"
import type { Receipt } from "@/schemas"

type ReceiptDetailsProps = {
  receipt: Receipt
}

export function ReceiptDetails({ receipt }: ReceiptDetailsProps) {
  const {
    id,
    imageData,
    mimeType,
    vendorName,
    totalAmount,
    receiptDate,
    taxAmount,
    paymentType,
    capturedAt,
    verifiedAt,
    lineItems,
  } = receipt
  const t = useTranslations("Receipt")
  const format = useFormatter()
  const [viewerOpen, setViewerOpen] = React.useState(false)

  const dataUri = `data:${mimeType};base64,${imageData}`
  const formatDate = (date: Date) =>
    format.dateTime(date, { year: "numeric", month: "short", day: "numeric" })
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
            alt={t("receiptImage")}
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
            <span className="sr-only">{t("viewFullImage")}</span>
          </Button>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t("receiptDetails")}</h2>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link href={`/receipt/${id}/edit`}>
                <Pencil className="h-3.5 w-3.5" />
                {t("edit")}
              </Link>
            </Button>
          </div>

          <dl className="space-y-3 flex-1">
            <DetailRow label={t("vendorName")} value={vendorName} />
            <DetailRow
              label={t("totalAmount")}
              value={
                totalAmount != null
                  ? `${Number(totalAmount).toFixed(2)} RON`
                  : null
              }
            />
            <DetailRow
              label={t("receiptDate")}
              value={receiptDate ? formatDate(receiptDate) : null}
            />
            <DetailRow
              label={t("taxAmount")}
              value={
                taxAmount != null ? `${Number(taxAmount).toFixed(2)} RON` : null
              }
            />
            <DetailRow
              label={t("paymentType")}
              value={paymentType ? t(paymentType) : null}
            />
            <DetailRow label={t("capturedOn")} value={formatDate(capturedAt)} />
            {verifiedAt && (
              <DetailRow
                label={t("verifiedOn")}
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
            {t("products")} ({lineItems.length})
          </h2>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-full">{t("productName")}</TableHead>
                <TableHead className="text-center">{t("qty")}</TableHead>
                <TableHead className="text-right">{t("unitPrice")}</TableHead>
                <TableHead className="text-right">{t("lineTotal")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-center tabular-nums">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.unitPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {item.totalPrice.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {itemsSubtotal > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="text-right">
                    {t("itemsSubtotal")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {itemsSubtotal.toFixed(2)} RON
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      )}

      <ImageViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        src={dataUri}
        alt={t("receiptImage")}
      />
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="text-sm text-muted-foreground w-28 shrink-0">{label}</dt>
      <dd className="text-sm font-medium">{value ?? "—"}</dd>
    </div>
  )
}
