'use client'

import { Camera } from 'lucide-react'
import { useTranslations } from 'next-intl'

type FabButtonProps = {
  onClick: () => void
}

export function FabButton({ onClick }: FabButtonProps) {
  const t = useTranslations('Camera')

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
      aria-label={t('capture')}
    >
      <Camera className="h-6 w-6" />
    </button>
  )
}
