"use client"

import { CheckCircle, Eye, Loader2, RotateCcw, XCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { useCallback, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { BatchItem } from "@/schemas"

interface Props {
  items: BatchItem[]
  onReview: (receiptId: string) => void
  onSaveAll: () => Promise<void>
  onDone: () => void
}

export function BatchSummary({ items, onReview, onSaveAll, onDone }: Props) {
  const t = useTranslations("Batch")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set())

  const successCount = items.filter((i) => i.status === "done").length
  const failedCount = items.filter((i) => i.status === "failed").length

  const handleSaveAll = useCallback(async () => {
    setSaving(true)
    try {
      await onSaveAll()
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }, [onSaveAll])

  const handleReview = useCallback(
    (receiptId: string) => {
      setReviewedIds((prev) => new Set(prev).add(receiptId))
      onReview(receiptId)
    },
    [onReview],
  )

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <h2 className="text-lg font-semibold">{t("summaryTitle")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("processed", { success: successCount, failed: failedCount })}
        </p>
      </div>

      {/* Results list */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <div
              key={`${item.file.name}-${index}`}
              className="flex items-center gap-3 rounded-lg border bg-card p-3"
            >
              {/* Thumbnail */}
              <img
                src={item.previewUrl}
                alt={item.file.name}
                className="h-16 w-12 shrink-0 rounded-md object-cover"
              />

              {/* Info */}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  {item.status === "done" ? (
                    <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                  )}
                  <span className="truncate text-sm font-medium">
                    {item.status === "done" && item.result?.vendorName
                      ? item.result.vendorName
                      : t("unknownVendor")}
                  </span>
                </div>
                {item.status === "done" && item.result?.totalAmount != null && (
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {item.result.totalAmount.toFixed(2)} RON
                  </span>
                )}
                {item.status === "failed" && item.error && (
                  <span className="text-xs text-destructive">{item.error}</span>
                )}
              </div>

              {/* Actions */}
              <div className="shrink-0">
                {item.status === "done" && item.receiptId && (
                  <>
                    {reviewedIds.has(item.receiptId) ? (
                      <Badge variant="secondary" className="text-xs">
                        {t("reviewed")}
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReview(item.receiptId!)}
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        {t("review")}
                      </Button>
                    )}
                  </>
                )}
                {item.status === "failed" && (
                  <Button variant="outline" size="sm" disabled>
                    <RotateCcw className="mr-1 h-3.5 w-3.5" />
                    {t("retry")}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t p-4">
        {!saved ? (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onDone}>
              {t("cancel")}
            </Button>
            <Button
              className="flex-1"
              onClick={handleSaveAll}
              disabled={saving || successCount === 0}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("saveAll")}
                </>
              ) : (
                t("saveAll")
              )}
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={onDone}>
            {t("allDone")}
          </Button>
        )}
      </div>
    </div>
  )
}
