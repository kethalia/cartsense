'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/utils'

export function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function onChange(newLocale: string) {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <div className="space-y-1.5">
      <span className="px-2 text-xs font-medium text-muted-foreground">
        {t('en') === 'English' ? 'Language' : 'Limbă'}
      </span>
      <div className="flex gap-1">
        {routing.locales.map((loc) => (
          <button
            key={loc}
            onClick={() => onChange(loc)}
            className={cn(
              'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              locale === loc
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
            )}
          >
            {t(loc)}
          </button>
        ))}
      </div>
    </div>
  )
}
