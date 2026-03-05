'use client'

import { useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { FabMenu } from '@/components/capture/fab-menu'
import { CameraCapture, type CameraCaptureHandle } from '@/components/capture/camera-capture'
import { FileUpload, type FileUploadHandle } from '@/components/capture/file-upload'
import { PhotoPreview } from '@/components/capture/photo-preview'
import { captureReceipt } from '@/actions/capture-receipt'
import { fileToBase64 } from '@/lib/utils'

type CaptureState = 'idle' | 'previewing' | 'saving'

type PreviewData = {
  file: File
  previewUrl: string
}

export function CaptureFlow() {
  const t = useTranslations('Dashboard')
  const tCamera = useTranslations('Camera')
  const router = useRouter()
  const cameraRef = useRef<CameraCaptureHandle>(null)
  const uploadRef = useRef<FileUploadHandle>(null)
  const [state, setState] = useState<CaptureState>('idle')
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)

  const { executeAsync } = useAction(captureReceipt, {
    onSuccess: ({ data }) => {
      toast.success(t('receiptSaved'))

      if (previewData) {
        URL.revokeObjectURL(previewData.previewUrl)
      }
      setPreviewData(null)
      setState('idle')

      // Navigate to verification page for AI extraction + review
      if (data?.id) {
        router.push(`/receipt/${data.id}/verify`)
      } else {
        // Fallback: just refresh dashboard
        router.refresh()
      }
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

  const handleUploadError = useCallback(
    (messageKey: string) => {
      toast.error(tCamera(messageKey))
    },
    [tCamera]
  )

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

      {/* Hidden file upload input */}
      <FileUpload ref={uploadRef} onUpload={handleCapture} onError={handleUploadError} />

      {/* FAB menu — always visible when not in preview */}
      {state !== 'previewing' && state !== 'saving' && (
        <FabMenu
          onTakePhoto={handleFabClick}
          onUploadImage={() => uploadRef.current?.trigger()}
        />
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
