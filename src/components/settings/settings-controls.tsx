'use client'

import { useState, useEffect } from 'react'
import { useClerk } from '@clerk/nextjs'
import { useTranslations, useLocale } from 'next-intl'
import { useTheme } from 'next-themes'
import { useRouter, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { LogOut, Sun, Moon, Monitor, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const themeOptions = [
  { value: 'light', icon: Sun, labelKey: 'light' as const },
  { value: 'dark', icon: Moon, labelKey: 'dark' as const },
  { value: 'system', icon: Monitor, labelKey: 'system' as const },
] as const

export function SettingsControls() {
  const t = useTranslations('Settings')
  const tTheme = useTranslations('Theme')
  const tLocale = useTranslations('LocaleSwitcher')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { signOut } = useClerk()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  function onLocaleChange(newLocale: string) {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <>
      {/* Appearance Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('appearance')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t('language')}</span>
            </div>
            <div className="flex gap-2">
              {routing.locales.map((loc) => (
                <Button
                  key={loc}
                  variant={locale === loc ? 'default' : 'outline'}
                  size="lg"
                  className="flex-1"
                  onClick={() => onLocaleChange(loc)}
                >
                  {tLocale(loc)}
                </Button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <span className="text-sm font-medium">{t('theme')}</span>
            {mounted ? (
              <div className="flex gap-2">
                {themeOptions.map(({ value, icon: Icon, labelKey }) => (
                  <Button
                    key={value}
                    variant={theme === value ? 'default' : 'outline'}
                    size="lg"
                    className="flex-1 gap-2"
                    onClick={() => setTheme(value)}
                  >
                    <Icon className="h-4 w-4" />
                    {tTheme(labelKey)}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="flex gap-2">
                {themeOptions.map(({ value }) => (
                  <div
                    key={value}
                    className="h-11 flex-1 animate-pulse rounded-md bg-muted"
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('account')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            size="lg"
            className="w-full"
            onClick={() => signOut({ redirectUrl: '/auth' })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t('logout')}
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
