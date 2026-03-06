'use client'

import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { ReceiptImage } from '@/schemas'

type ProcessingSkeletonProps = {
  image: ReceiptImage
}

export function ProcessingSkeleton({ image }: ProcessingSkeletonProps) {
  const t = useTranslations('Receipt')

  return (
    <div className="space-y-6">
      {/* ── Top: Image + skeleton form side by side ── */}
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
        {/* Image — aspect-square, fixed width on desktop */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:${image.mimeType};base64,${image.imageData}`}
            alt={t('receiptImage')}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Skeleton form */}
        <div className="flex flex-col">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-4 flex-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom: skeleton products table ── */}
      <div>
        <Skeleton className="h-6 w-28 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>

      {/* Processing indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{t('processing')}</span>
      </div>
    </div>
  )
}
