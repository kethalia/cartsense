"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { Sun, Moon, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"

const themeOptions = [
  { value: "light", icon: Sun, labelKey: "light" as const },
  { value: "dark", icon: Moon, labelKey: "dark" as const },
  { value: "system", icon: Monitor, labelKey: "system" as const },
]

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const t = useTranslations("Theme")

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="flex gap-1">
        {themeOptions.map((opt) => (
          <div key={opt.value} className="h-8 flex-1 rounded-md bg-muted" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-1">
      {themeOptions.map(({ value, icon: Icon, labelKey }) => (
        <Button
          key={value}
          variant={theme === value ? "secondary" : "ghost"}
          size="icon"
          className="flex-1"
          onClick={() => setTheme(value)}
          aria-label={t(labelKey)}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  )
}
