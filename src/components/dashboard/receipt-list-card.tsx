"use client"

import { useLocale, useTranslations } from "next-intl"
import { CategoryChip } from "@/components/receipt/category-chip"
import { Link } from "@/i18n/navigation"

interface CategoryData {
  id: string
  name: string
  nameRo: string | null
  slug: string
  color: string
  icon: string | null
}

interface ReceiptData {
  id: string
  vendorName: string | null
  totalAmount: number | null
  receiptDate: Date | string | null
  capturedAt: Date | string
  categoryId: string | null
  category: CategoryData | null
  imageData: string
  mimeType: string
}

interface Props {
  receipt: ReceiptData
  onCategoryClick?: (receiptId: string) => void
}

export function ReceiptListCard({ receipt, onCategoryClick }: Props) {
  const locale = useLocale()
  const t = useTranslations("ReceiptList")

  const {
    id,
    vendorName,
    totalAmount,
    capturedAt,
    category,
    imageData,
    mimeType,
  } = receipt

  const time = new Date(capturedAt).toLocaleTimeString(
    locale === "ro" ? "ro-RO" : "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    },
  )

  const formattedAmount = totalAmount
    ? new Intl.NumberFormat(locale === "ro" ? "ro-RO" : "en-US", {
        style: "currency",
        currency: "RON",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(totalAmount)
    : t("noAmount")

  const dataUri = `data:${mimeType};base64,${imageData}`

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3 transition-colors hover:bg-accent/50">
      {/* Thumbnail */}
      <Link href={`/receipt/${id}`} className="shrink-0">
        <img
          src={dataUri}
          alt={vendorName ?? "Receipt"}
          className="h-16 w-12 rounded-md object-cover"
        />
      </Link>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/receipt/${id}`}
            className="truncate text-sm font-medium hover:underline"
          >
            {vendorName ?? t("noAmount")}
          </Link>
          <CategoryChip
            category={category}
            onClick={onCategoryClick ? () => onCategoryClick(id) : undefined}
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium tabular-nums text-foreground">
            {formattedAmount}
          </span>
          <span>·</span>
          <span className="tabular-nums">{time}</span>
        </div>
      </div>
    </div>
  )
}
