"use client"

import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"
import { BatchSummary } from "@/components/capture/batch-summary"
import { BatchUpload } from "@/components/capture/batch-upload"
import {
  CameraCapture,
  type CameraCaptureHandle,
} from "@/components/capture/camera-capture"
import { FabMenu } from "@/components/capture/fab-menu"
import {
  FileUpload,
  type FileUploadHandle,
} from "@/components/capture/file-upload"
import { PhotoPreview } from "@/components/capture/photo-preview"
import { useRouter } from "@/i18n/navigation"
import { batchSaveAll } from "@/lib/actions/batch-upload"
import { captureReceipt } from "@/lib/actions/capture-receipt"
import type { BatchItem } from "@/schemas"

type CaptureState = "idle" | "previewing" | "saving" | "batch" | "batch-summary"

type PreviewData = {
  file: File
  previewUrl: string
}

export function CaptureFlow() {
  const t = useTranslations("Dashboard")
  const tBatch = useTranslations("Batch")
  const tCamera = useTranslations("Camera")
  const router = useRouter()
  const cameraRef = useRef<CameraCaptureHandle>(null)
  const uploadRef = useRef<FileUploadHandle>(null)
  const [state, setState] = useState<CaptureState>("idle")
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [batchItems, setBatchItems] = useState<BatchItem[]>([])

  const { executeAsync } = useAction(captureReceipt, {
    onSuccess: ({ data }) => {
      toast.success(t("receiptSaved"))

      if (previewData) {
        URL.revokeObjectURL(previewData.previewUrl)
      }
      setPreviewData(null)
      setState("idle")

      // Navigate to dedicated verify page
      if (data?.id) {
        router.push(`/receipt/${data.id}/verify`)
      } else {
        router.refresh()
      }
    },
    onError: ({ error }) => {
      const message =
        error.validationErrors?._errors?.[0] ??
        error.serverError ??
        "Failed to save receipt"
      toast.error(message)
      setState("previewing")
    },
  })

  const saveAllAction = useAction(batchSaveAll)

  const handleFabClick = useCallback(() => {
    cameraRef.current?.trigger()
  }, [])

  const handleCapture = useCallback((file: File, previewUrl: string) => {
    setPreviewData({ file, previewUrl })
    setState("previewing")
  }, [])

  const handleUploadError = useCallback(
    (messageKey: string) => {
      toast.error(tCamera(messageKey))
    },
    [tCamera],
  )

  const handleClose = useCallback(() => {
    if (previewData) {
      URL.revokeObjectURL(previewData.previewUrl)
    }
    setPreviewData(null)
    setState("idle")
  }, [previewData])

  const handleRetake = useCallback(() => {
    handleClose()
    // Re-trigger camera after a tick (allow state to settle)
    setTimeout(() => {
      cameraRef.current?.trigger()
    }, 100)
  }, [handleClose])

  const handleConfirm = useCallback(async () => {
    if (!previewData) return

    setState("saving")

    // Pass the raw File directly — no base64 encoding needed
    await executeAsync({ image: previewData.file })
  }, [previewData, executeAsync])

  // ── Batch handlers ──

  const handleBatchUpload = useCallback(() => {
    setState("batch")
  }, [])

  const handleBatchComplete = useCallback((items: BatchItem[]) => {
    setBatchItems(items)
    setState("batch-summary")
  }, [])

  const handleBatchClose = useCallback(() => {
    setBatchItems([])
    setState("idle")
  }, [])

  const handleBatchReview = useCallback(
    (receiptId: string) => {
      router.push(`/receipt/${receiptId}/verify`)
    },
    [router],
  )

  const handleBatchSaveAll = useCallback(async () => {
    const doneIds = batchItems
      .filter((item) => item.status === "done" && item.receiptId)
      .map((item) => item.receiptId!)

    if (doneIds.length === 0) return

    try {
      const result = await saveAllAction.executeAsync({
        receiptIds: doneIds,
      })
      if (result?.data) {
        toast.success(tBatch("savedCount", { count: result.data.saved }))
      }
    } catch {
      toast.error(tBatch("failed"))
    }
  }, [batchItems, saveAllAction, tBatch])

  const handleBatchDone = useCallback(() => {
    // Clean up preview URLs
    for (const item of batchItems) {
      URL.revokeObjectURL(item.previewUrl)
    }
    setBatchItems([])
    setState("idle")
    router.refresh()
  }, [batchItems, router])

  const showFab =
    state !== "previewing" &&
    state !== "saving" &&
    state !== "batch" &&
    state !== "batch-summary"

  return (
    <>
      {/* Hidden camera input */}
      <CameraCapture ref={cameraRef} onCapture={handleCapture} />

      {/* Hidden file upload input */}
      <FileUpload
        ref={uploadRef}
        onUpload={handleCapture}
        onError={handleUploadError}
      />

      {/* FAB menu — always visible when idle */}
      {showFab && (
        <FabMenu
          onTakePhoto={handleFabClick}
          onUploadImage={() => uploadRef.current?.trigger()}
          onBatchUpload={handleBatchUpload}
        />
      )}

      {/* Photo preview overlay */}
      {previewData && (state === "previewing" || state === "saving") && (
        <PhotoPreview
          previewUrl={previewData.previewUrl}
          onConfirm={handleConfirm}
          onRetake={handleRetake}
          onClose={handleClose}
        />
      )}

      {/* Batch upload flow */}
      {state === "batch" && (
        <BatchUpload
          onClose={handleBatchClose}
          onComplete={handleBatchComplete}
        />
      )}

      {/* Batch summary */}
      {state === "batch-summary" && (
        <BatchSummary
          items={batchItems}
          onReview={handleBatchReview}
          onSaveAll={handleBatchSaveAll}
          onDone={handleBatchDone}
        />
      )}
    </>
  )
}
