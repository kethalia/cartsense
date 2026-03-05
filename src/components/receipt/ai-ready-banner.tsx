'use client'

import { useTranslations } from 'next-intl'
import { Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type AIReadyBannerProps = {
  onMerge: () => void
  onDismiss: () => void
}

export function AIReadyBanner({ onMerge, onDismiss }: AIReadyBannerProps) {
  const t = useTranslations('Receipt')

  return (
    <div className="sticky top-0 z-50 mb-4 flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 shadow-sm dark:border-blue-800 dark:bg-blue-950">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
          {t('aiReady')}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onMerge}>
          {t('compareAndMerge')}
        </Button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md p-1 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900"
          aria-label={t('dismiss')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
