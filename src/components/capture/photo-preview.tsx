'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

type PhotoPreviewProps = {
  previewUrl: string
  onConfirm: () => Promise<void>
  onRetake: () => void
}

export function PhotoPreview({ previewUrl, onConfirm, onRetake }: PhotoPreviewProps) {
  const t = useTranslations('Camera')
  const [saving, setSaving] = useState(false)

  const handleConfirm = async () => {
    setSaving(true)
    try {
      await onConfirm()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Image preview — takes most of the screen */}
      <div className="flex flex-1 items-center justify-center overflow-hidden bg-black/5 p-4 dark:bg-white/5">
        <img
          src={previewUrl}
          alt="Captured receipt preview"
          className="max-h-full max-w-full rounded-lg object-contain shadow-lg"
        />
      </div>

      {/* Action buttons at the bottom */}
      <div className="flex gap-3 border-t bg-background p-4 pb-safe">
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={onRetake}
          disabled={saving}
        >
          {t('retake')}
        </Button>
        <Button
          size="lg"
          className="flex-1"
          onClick={handleConfirm}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('useThis')}
            </>
          ) : (
            t('useThis')
          )}
        </Button>
      </div>
    </div>
  )
}
