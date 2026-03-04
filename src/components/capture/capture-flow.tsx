'use client'

import { useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { FabButton } from '@/components/capture/fab-button'
import { CameraCapture, type CameraCaptureHandle } from '@/components/capture/camera-capture'
import { PhotoPreview } from '@/components/capture/photo-preview'

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
  const [state, setState] = useState<CaptureState>('idle')
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)

  const handleFabClick = useCallback(() => {
    cameraRef.current?.trigger()
  }, [])

  const handleCapture = useCallback((file: File, previewUrl: string) => {
    setPreviewData({ file, previewUrl })
    setState('previewing')
  }, [])

  const handleRetake = useCallback(() => {
    if (previewData) {
      URL.revokeObjectURL(previewData.previewUrl)
    }
    setPreviewData(null)
    setState('idle')
    // Re-trigger camera after a tick (allow state to settle)
    setTimeout(() => {
      cameraRef.current?.trigger()
    }, 100)
  }, [previewData])

  const handleConfirm = useCallback(async () => {
    if (!previewData) return

    setState('saving')

    try {
      // Convert file to base64
      const base64 = await fileToBase64(previewData.file)

      // POST to API
      const response = await fetch('/api/receipts/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: base64,
          mimeType: previewData.file.type,
          fileSize: previewData.file.size,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to save receipt')
      }

      // Success
      toast.success(t('receiptSaved'))

      // Clean up preview
      URL.revokeObjectURL(previewData.previewUrl)
      setPreviewData(null)
      setState('idle')

      // Refresh dashboard to show new receipt
      router.refresh()
    } catch (error) {
      console.error('Failed to save receipt:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to save receipt'
      )
      setState('previewing')
    }
  }, [previewData, router, t])

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
