'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
import { Sun, Moon, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'

const themeOptions = [
  { value: 'light', icon: Sun, labelKey: 'light' as const },
  { value: 'dark', icon: Moon, labelKey: 'dark' as const },
  { value: 'system', icon: Monitor, labelKey: 'system' as const },
]

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const t = useTranslations('Theme')

  useEffect(() => setMounted(true), [])

  // Render skeleton placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div>
        <div className="flex gap-1">
          {themeOptions.map((opt) => (
            <div
              key={opt.value}
              className="h-8 flex-1 rounded-md bg-muted"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-1">
        {themeOptions.map(({ value, icon: Icon, labelKey }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              'flex flex-1 items-center justify-center rounded-md p-2 transition-colors',
              theme === value
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
            )}
            aria-label={t(labelKey)}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  )
}
