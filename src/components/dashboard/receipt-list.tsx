"use client"

import { useTranslations } from "next-intl"
import { DateGroupHeader } from "@/components/dashboard/date-group-header"
import { ReceiptListCard } from "@/components/dashboard/receipt-list-card"

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

export function ReceiptList({ receipts }: Props) {
  const t = useTranslations("ReceiptList")

  const groups = groupReceiptsByDate(receipts)

  if (receipts.length === 0) return null

  return (
    <div className="space-y-1">
      {groups.map((group) => (
        <div key={group.date}>
          <DateGroupHeader date={group.date} dailyTotal={group.dailyTotal} />
          <div className="space-y-2">
            {group.receipts.map((receipt) => (
              <ReceiptListCard key={receipt.id} receipt={receipt} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
