'use client'

import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

type ProcessingSkeletonProps = {
  imageData: string
  mimeType: string
  timedOut: boolean
  onSkip: () => void
}

export function ProcessingSkeleton({
  imageData,
  mimeType,
  timedOut,
  onSkip,
}: ProcessingSkeletonProps) {
  const t = useTranslations('Receipt')

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      {/* Receipt image thumbnail */}
      <div className="flex-shrink-0 md:w-1/3">
        <div className="overflow-hidden rounded-lg border bg-muted">
          <img
            src={`data:${mimeType};base64,${imageData}`}
            alt={t('receiptImage')}
            className="h-auto w-full object-contain"
          />
        </div>
      </div>

      {/* Skeleton form */}
      <div className="flex flex-1 flex-col gap-4">
        {/* Skeleton rows matching receipt fields */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full max-w-[16rem]" />
          </div>
        ))}

        {/* Status message */}
        <div className="mt-4 flex flex-col items-center gap-3">
          {!timedOut ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t('processing')}</span>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {t('takingLonger')}
              </p>
              <Button variant="outline" size="sm" onClick={onSkip}>
                {t('skipToManual')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
