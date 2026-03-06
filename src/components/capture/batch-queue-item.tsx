"use client"

import { CheckCircle, Clock, Loader2, X, XCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import type { BatchItemStatus } from "@/schemas"

interface Props {
  fileName: string
  previewUrl: string
  status: BatchItemStatus
  result?: { vendorName: string | null; totalAmount: number | null }
  error?: string
  onRemove?: () => void
}

const statusIcons: Record<BatchItemStatus, typeof Clock> = {
  queued: Clock,
  uploading: Loader2,
  extracting: Loader2,
  done: CheckCircle,
  failed: XCircle,
}

const statusColors: Record<BatchItemStatus, string> = {
  queued: "text-muted-foreground",
  uploading: "text-blue-500",
  extracting: "text-blue-500",
  done: "text-green-500",
  failed: "text-destructive",
}

export function BatchQueueItem({
  fileName,
  previewUrl,
  status,
  result,
  error,
  onRemove,
}: Props) {
  const t = useTranslations("Batch")
  const Icon = statusIcons[status]
  const isSpinning = status === "uploading" || status === "extracting"

  const statusLabel: Record<BatchItemStatus, string> = {
    queued: t("queued"),
    uploading: t("uploading"),
    extracting: t("extracting"),
    done: t("done"),
    failed: t("failed"),
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-2">
      {/* Thumbnail */}
      <img
        src={previewUrl}
        alt={fileName}
        className="h-16 w-12 shrink-0 rounded-md object-cover"
      />

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <Icon
            className={`h-4 w-4 shrink-0 ${statusColors[status]} ${isSpinning ? "animate-spin" : ""}`}
          />
          <span className="truncate text-sm font-medium">
            {status === "done" && result?.vendorName
              ? result.vendorName
              : fileName}
          </span>
        </div>
        <span className={`text-xs ${statusColors[status]}`}>
          {statusLabel[status]}
          {status === "done" && result?.totalAmount != null && (
            <span className="ml-1 tabular-nums">
              {result.totalAmount.toFixed(2)} RON
            </span>
          )}
          {status === "failed" && error && (
            <span className="ml-1 text-destructive">{error}</span>
          )}
        </span>
      </div>

      {/* Remove button — only when queued */}
      {status === "queued" && onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onRemove}
          aria-label={t("cancel")}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
