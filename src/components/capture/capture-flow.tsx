'use client'

import { useRef, useState, useCallback } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { FabMenu } from '@/components/capture/fab-menu'
import { CameraCapture, type CameraCaptureHandle } from '@/components/capture/camera-capture'
import { FileUpload, type FileUploadHandle } from '@/components/capture/file-upload'
import { PhotoPreview } from '@/components/capture/photo-preview'
import { captureReceipt } from '@/actions/capture-receipt'

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

    // Send the raw File via FormData — no base64 bloat
    const formData = new FormData()
    formData.append('image', previewData.file)

    try {
      const result = await captureReceipt(formData)

      toast.success(t('receiptSaved'))

      if (previewData) {
        URL.revokeObjectURL(previewData.previewUrl)
      }
      setPreviewData(null)
      setState('idle')

      // Navigate to dedicated verify page
      if (result?.id) {
        router.push(`/receipt/${result.id}/verify`)
      } else {
        router.refresh()
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save receipt'
      toast.error(message)
      setState('previewing')
    }
  }, [previewData, t, router])

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
