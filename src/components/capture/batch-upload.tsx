"use client"

import { Loader2, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { useCallback, useRef, useState } from "react"
import { BatchQueue } from "@/components/capture/batch-queue"
import { Button } from "@/components/ui/button"
import { captureReceipt } from "@/lib/actions/capture-receipt"
import { extractReceipt } from "@/lib/actions/extract-receipt"
import { BATCH_MAX_RECEIPTS } from "@/lib/config"
import type { BatchItem } from "@/schemas"

type BatchPhase = "queue" | "processing" | "summary"

interface Props {
  onClose: () => void
  onComplete: (items: BatchItem[]) => void
}

export function BatchUpload({ onClose, onComplete }: Props) {
  const t = useTranslations("Batch")
  const [phase, setPhase] = useState<BatchPhase>("queue")
  const [items, setItems] = useState<BatchItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const cancelledRef = useRef(false)

  const captureAction = useAction(captureReceipt)
  const extractAction = useAction(extractReceipt)

  const handleAdd = useCallback((files: File[]) => {
    const newItems: BatchItem[] = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      status: "queued" as const,
    }))
    setItems((prev) => [...prev, ...newItems])
  }, [])

  const handleRemove = useCallback((index: number) => {
    setItems((prev) => {
      const item = prev[index]
      if (item) {
        URL.revokeObjectURL(item.previewUrl)
      }
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const processItems = useCallback(async () => {
    setPhase("processing")
    cancelledRef.current = false

    for (let i = 0; i < items.length; i++) {
      if (cancelledRef.current) break

      setCurrentIndex(i)

      // Step 1: Upload
      setItems((prev) =>
        prev.map((item, idx) =>
          idx === i ? { ...item, status: "uploading" as const } : item,
        ),
      )

      try {
        const captureResult = await captureAction.executeAsync({
          image: items[i].file,
        })

        if (!captureResult?.data?.id) {
          const error = captureResult?.serverError ?? "Upload failed"
          setItems((prev) =>
            prev.map((item, idx) =>
              idx === i ? { ...item, status: "failed" as const, error } : item,
            ),
          )
          continue
        }

        const receiptId = captureResult.data.id

        // Step 2: Extract
        setItems((prev) =>
          prev.map((item, idx) =>
            idx === i
              ? { ...item, status: "extracting" as const, receiptId }
              : item,
          ),
        )

        const extractResult = await extractAction.executeAsync({ receiptId })

        if (
          extractResult?.data?.status === "success" &&
          extractResult.data.data
        ) {
          setItems((prev) =>
            prev.map((item, idx) =>
              idx === i
                ? {
                    ...item,
                    status: "done" as const,
                    receiptId,
                    result: {
                      vendorName: extractResult.data!.data!.vendorName,
                      totalAmount: extractResult.data!.data!.totalAmount,
                    },
                  }
                : item,
            ),
          )
        } else {
          setItems((prev) =>
            prev.map((item, idx) =>
              idx === i
                ? {
                    ...item,
                    status: "done" as const,
                    receiptId,
                    result: {
                      vendorName: null,
                      totalAmount: null,
                    },
                  }
                : item,
            ),
          )
        }
      } catch (err) {
        const error = err instanceof Error ? err.message : "Processing failed"
        setItems((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: "failed" as const, error } : item,
          ),
        )
      }
    }

    // Transition to summary phase
    setItems((current) => {
      // Use timeout to ensure state is settled before calling onComplete
      setTimeout(() => {
        onComplete(current)
      }, 0)
      return current
    })
  }, [items, captureAction, extractAction, onComplete])

  const handleCancel = useCallback(() => {
    if (phase === "processing") {
      cancelledRef.current = true
      // Keep already-processed items, complete with what we have
      setItems((current) => {
        const processed = current.map((item) =>
          item.status === "queued"
            ? { ...item, status: "failed" as const, error: "Cancelled" }
            : item,
        )
        setTimeout(() => {
          onComplete(processed)
        }, 0)
        return processed
      })
    } else {
      // Clean up preview URLs
      for (const item of items) {
        URL.revokeObjectURL(item.previewUrl)
      }
      onClose()
    }
  }, [phase, items, onClose, onComplete])

  const isProcessing = phase === "processing"
  const canStart = items.length > 0 && phase === "queue"

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-lg font-semibold">{t("title")}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          aria-label={t("cancel")}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isProcessing && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("processing", {
              current: currentIndex + 1,
              total: items.length,
            })}
          </div>
        )}

        <BatchQueue
          items={items}
          onAdd={handleAdd}
          onRemove={handleRemove}
          maxItems={BATCH_MAX_RECEIPTS}
          disabled={isProcessing}
        />
      </div>

      {/* Footer */}
      <div className="border-t p-4">
        {phase === "queue" && (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleCancel}>
              {t("cancel")}
            </Button>
            <Button
              className="flex-1"
              onClick={processItems}
              disabled={!canStart}
            >
              {t("startProcessing")}
            </Button>
          </div>
        )}

        {isProcessing && (
          <Button variant="outline" className="w-full" onClick={handleCancel}>
            {t("cancel")}
          </Button>
        )}
      </div>
    </div>
  )
}
