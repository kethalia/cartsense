"use client"

import { SearchX } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { DateGroupHeader } from "@/components/dashboard/date-group-header"
import { ReceiptListCard } from "@/components/dashboard/receipt-list-card"
import { CategoryPicker } from "@/components/receipt/category-picker"
import type { Category } from "@/schemas"

interface CategoryData {
  id: string
  name: string
  nameRo: string | null
  slug: string
  color: string
  icon: string | null
}

export interface ReceiptWithCategory {
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

export type MatchContext = Record<
  string,
  { field: string; matchedText: string }[]
>

interface Props {
  receipts: ReceiptWithCategory[]
  matchContext?: MatchContext
  isFiltered?: boolean
}

interface DateGroup {
  date: string
  dailyTotal: number
  receipts: ReceiptWithCategory[]
}

function groupReceiptsByDate(receipts: ReceiptWithCategory[]): DateGroup[] {
  const groups = new Map<string, ReceiptWithCategory[]>()

  for (const receipt of receipts) {
    const dateStr = receipt.receiptDate
      ? new Date(receipt.receiptDate).toISOString().split("T")[0]
      : new Date(receipt.capturedAt).toISOString().split("T")[0]

    const existing = groups.get(dateStr)
    if (existing) {
      existing.push(receipt)
    } else {
      groups.set(dateStr, [receipt])
    }
  }

  // Sort groups by date descending
  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, receipts]) => ({
      date,
      dailyTotal: receipts.reduce((sum, r) => sum + (r.totalAmount ?? 0), 0),
      receipts,
    }))
}

export function ReceiptList({
  receipts: initialReceipts,
  matchContext,
  isFiltered,
}: Props) {
  const t = useTranslations("ReceiptList")
  const tSearch = useTranslations("Search")
  const [receipts, setReceipts] =
    useState<ReceiptWithCategory[]>(initialReceipts)
  const [pickerState, setPickerState] = useState<{
    open: boolean
    receiptId: string | null
  }>({ open: false, receiptId: null })

  // When filtering, use initialReceipts directly (from search results)
  // When not filtering, use local state (supports optimistic category updates)
  const displayReceipts = isFiltered ? initialReceipts : receipts

  const groups = groupReceiptsByDate(displayReceipts)

  const selectedReceipt = pickerState.receiptId
    ? displayReceipts.find((r) => r.id === pickerState.receiptId)
    : null

  function handleCategoryClick(receiptId: string) {
    setPickerState({ open: true, receiptId })
  }

  function handleCategoryChange(category: Category) {
    if (!pickerState.receiptId) return

    // Optimistic update
    setReceipts((prev) =>
      prev.map((r) =>
        r.id === pickerState.receiptId
          ? {
              ...r,
              categoryId: category.id,
              category: {
                id: category.id,
                name: category.name,
                nameRo: category.nameRo,
                slug: category.slug,
                color: category.color,
                icon: category.icon,
              },
            }
          : r,
      ),
    )

    setPickerState({ open: false, receiptId: null })
  }

  // No-results state for filtered search
  if (isFiltered && displayReceipts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <SearchX className="h-12 w-12 text-muted-foreground/50" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            {tSearch("noResults")}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {tSearch("adjustFilters")}
          </p>
        </div>
      </div>
    )
  }

  if (displayReceipts.length === 0) return null

  return (
    <>
      <div className="space-y-1">
        {groups.map((group) => (
          <div key={group.date}>
            <DateGroupHeader date={group.date} dailyTotal={group.dailyTotal} />
            <div className="space-y-2">
              {group.receipts.map((receipt) => (
                <ReceiptListCard
                  key={receipt.id}
                  receipt={receipt}
                  matchContext={matchContext?.[receipt.id]}
                  onCategoryClick={handleCategoryClick}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <CategoryPicker
        open={pickerState.open}
        onOpenChange={(open: boolean) =>
          setPickerState((prev) => ({ ...prev, open }))
        }
        receiptId={pickerState.receiptId ?? ""}
        currentCategory={
          selectedReceipt?.category
            ? ({
                ...selectedReceipt.category,
                type: "receipt" as const,
                isCustom: false,
                userId: null,
                sortOrder: 0,
              } as Category)
            : null
        }
        type="receipt"
        onCategoryChange={handleCategoryChange}
      />
    </>
  )
}
