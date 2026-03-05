'use client'

import { useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { FabButton } from '@/components/capture/fab-button'
import { CameraCapture, type CameraCaptureHandle } from '@/components/capture/camera-capture'
import { PhotoPreview } from '@/components/capture/photo-preview'
import { captureReceipt } from '@/actions/capture-receipt'

type CaptureState = 'idle' | 'previewing' | 'saving'

type PreviewData = {
  file: File
  previewUrl: string
}

export function CaptureFlow() {
  const t = useTranslations('Dashboard')
  const router = useRouter()
  const cameraRef = useRef<CameraCaptureHandle>(null)
  const [state, setState] = useState<CaptureState>('idle')
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)

  const { executeAsync } = useAction(captureReceipt, {
    onSuccess: () => {
      toast.success(t('receiptSaved'))

      if (previewData) {
        URL.revokeObjectURL(previewData.previewUrl)
      }
      setPreviewData(null)
      setState('idle')

      router.refresh()
    },
    onError: ({ error }) => {
      const message =
        error.validationErrors?._errors?.[0] ??
        error.serverError ??
        'Failed to save receipt'
      toast.error(message)
      setState('previewing')
    },
  })

  const handleFabClick = useCallback(() => {
    cameraRef.current?.trigger()
  }, [])

  const handleCapture = useCallback((file: File, previewUrl: string) => {
    setPreviewData({ file, previewUrl })
    setState('previewing')
  }, [])

  const handleClose = useCallback(() => {
    if (previewData) {
      URL.revokeObjectURL(previewData.previewUrl)
    }
    setPreviewData(null)
    setState('idle')
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

    setState('saving')

    const base64 = await fileToBase64(previewData.file)

    await executeAsync({
      imageData: base64,
      mimeType: previewData.file.type,
      fileSize: previewData.file.size,
    })
  }, [previewData, executeAsync])

  return (
    <>
      {/* Hidden camera input */}
      <CameraCapture ref={cameraRef} onCapture={handleCapture} />

      {/* FAB button — always visible when not in preview */}
      {state !== 'previewing' && state !== 'saving' && (
        <FabButton onClick={handleFabClick} />
      )}

      {/* Photo preview overlay */}
      {previewData && (state === 'previewing' || state === 'saving') && (
        <PhotoPreview
          previewUrl={previewData.previewUrl}
          onConfirm={handleConfirm}
          onRetake={handleRetake}
          onClose={handleClose}
        />
      )}
    </>
  )
}

/** Convert a File to a base64 string (without the data URI prefix) */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove the "data:image/jpeg;base64," prefix
      const base64 = result.split(',')[1]
      if (base64) {
        resolve(base64)
      } else {
        reject(new Error('Failed to convert file to base64'))
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
