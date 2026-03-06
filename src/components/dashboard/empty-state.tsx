"use client"

import { Camera, ArrowDownRight } from "lucide-react"
import { useTranslations } from "next-intl"

export function EmptyState() {
  const t = useTranslations("Dashboard")

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      {/* Icon with dashed border */}
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/30">
        <Camera className="h-10 w-10 text-muted-foreground/50" />
      </div>

      {/* Encouraging message */}
      <h2 className="mb-2 text-center text-lg font-semibold text-foreground">
        {t("emptyState")}
      </h2>
      <p className="mb-12 text-center text-sm text-muted-foreground">
        {t("emptyStateHint")}
      </p>

      {/* Subtle arrow pointing toward bottom-right FAB */}
      <div className="flex items-center gap-1 text-muted-foreground/40">
        <ArrowDownRight className="h-5 w-5 animate-bounce" />
      </div>
    </div>
  )
}
