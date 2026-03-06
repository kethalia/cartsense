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
  matchContext?: { field: string; matchedText: string }[]
  onCategoryClick?: (receiptId: string) => void
}

export function ReceiptListCard({
  receipt,
  matchContext,
  onCategoryClick,
}: Props) {
  const locale = useLocale()
  const t = useTranslations("ReceiptList")
  const tSearch = useTranslations("Search")

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

  // Find vendor match for highlighting
  const vendorMatch = matchContext?.find((m) => m.field === "vendorName")
  // Find product name matches
  const productMatches = matchContext?.filter((m) => m.field === "itemName")

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
            {vendorMatch && vendorName ? (
              <span className="rounded-sm bg-yellow-100 px-0.5 dark:bg-yellow-800/30">
                {vendorName}
              </span>
            ) : (
              (vendorName ?? t("noAmount"))
            )}
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

        {/* Product name matches */}
        {productMatches && productMatches.length > 0 && (
          <div className="mt-0.5 text-xs text-muted-foreground">
            {productMatches.slice(0, 2).map((match, i) => (
              <span key={match.matchedText + i}>
                {i > 0 && ", "}
                {tSearch("matchedProduct", { product: match.matchedText })}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
