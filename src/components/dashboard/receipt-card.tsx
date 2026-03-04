'use client'

import { useTranslations, useFormatter } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'

type ReceiptCardProps = {
  id: string
  imageData: string
  mimeType: string
  fileSize: number | null
  capturedAt: Date
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ReceiptCard({ imageData, mimeType, fileSize, capturedAt }: ReceiptCardProps) {
  const t = useTranslations('Dashboard')
  const format = useFormatter()

  const formattedDate = format.dateTime(new Date(capturedAt), {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Card className="overflow-hidden p-0">
      {/* Thumbnail image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        <img
          src={`data:${mimeType};base64,${imageData}`}
          alt="Receipt"
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Caption */}
      <CardContent className="space-y-1 p-3">
        <p className="text-xs text-muted-foreground">
          {t('capturedAt', { date: formattedDate })}
        </p>
        {fileSize && (
          <p className="text-xs text-muted-foreground/70">
            {formatFileSize(fileSize)}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
