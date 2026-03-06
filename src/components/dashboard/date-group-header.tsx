"use client"

import { useLocale, useTranslations } from "next-intl"

interface Props {
  date: string
  dailyTotal: number
}

export function DateGroupHeader({ date, dailyTotal }: Props) {
  const locale = useLocale()
  const t = useTranslations("ReceiptList")

  const dateObj = new Date(date + "T00:00:00")
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const dateLabel = (() => {
    const d = new Date(date + "T00:00:00")
    d.setHours(0, 0, 0, 0)

    if (d.getTime() === today.getTime()) return t("today")
    if (d.getTime() === yesterday.getTime()) return t("yesterday")

    return dateObj.toLocaleDateString(locale === "ro" ? "ro-RO" : "en-US", {
      month: "long",
      day: "numeric",
    })
  })()

  const formattedTotal = new Intl.NumberFormat(
    locale === "ro" ? "ro-RO" : "en-US",
    {
      style: "currency",
      currency: "RON",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(dailyTotal)

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 px-1 py-2 backdrop-blur-sm">
      <span className="text-sm font-medium text-muted-foreground">
        {dateLabel}
      </span>
      {dailyTotal > 0 && (
        <span className="text-sm font-medium tabular-nums text-muted-foreground">
          {formattedTotal}
        </span>
      )}
    </div>
  )
}
