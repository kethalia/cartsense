'use client'

import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

type ProcessingSkeletonProps = {
  imageData: string
  mimeType: string
}

export function ProcessingSkeleton({ imageData, mimeType }: ProcessingSkeletonProps) {
  const t = useTranslations('Receipt')

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start max-w-2xl mx-auto">
      {/* Receipt image thumbnail */}
      <div className="flex-shrink-0 md:w-1/3">
        <div className="overflow-hidden rounded-lg border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:${mimeType};base64,${imageData}`}
            alt={t('receiptImage')}
            className="h-auto w-full object-contain"
          />
        </div>
      </div>

      {/* Skeleton form */}
      <div className="flex flex-1 flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}

        {/* Skeleton product rows */}
        <div className="border-t pt-3 mt-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>

        {/* Processing indicator */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t('processing')}</span>
        </div>
      </div>
    </div>
  )
}
