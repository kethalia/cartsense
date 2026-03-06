"use client"

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

interface Props {
  receipts: ReceiptWithCategory[]
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

export function ReceiptList({ receipts: initialReceipts }: Props) {
  const t = useTranslations("ReceiptList")
  const [receipts, setReceipts] =
    useState<ReceiptWithCategory[]>(initialReceipts)
  const [pickerState, setPickerState] = useState<{
    open: boolean
    receiptId: string | null
  }>({ open: false, receiptId: null })

  const groups = groupReceiptsByDate(receipts)

  const selectedReceipt = pickerState.receiptId
    ? receipts.find((r) => r.id === pickerState.receiptId)
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

  if (receipts.length === 0) return null

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
