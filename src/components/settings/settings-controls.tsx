"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useTheme } from "next-themes"
import { useRouter, usePathname } from "@/i18n/navigation"
import { useRouter as useNextRouter } from "next/navigation"
import { routing } from "@/i18n/routing"
import { signOut } from "@/lib/auth-client"
import { LogOut, Sun, Moon, Monitor } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const themeOptions = [
  { value: "light", icon: Sun, labelKey: "light" as const },
  { value: "dark", icon: Moon, labelKey: "dark" as const },
  { value: "system", icon: Monitor, labelKey: "system" as const },
] as const

export function SettingsControls() {
  const t = useTranslations("Settings")
  const tTheme = useTranslations("Theme")
  const tLocale = useTranslations("LocaleSwitcher")
  const locale = useLocale()
  const router = useRouter()
  const nextRouter = useNextRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  function onLocaleChange(newLocale: string) {
    router.replace(pathname, { locale: newLocale })
  }

  async function handleSignOut() {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          nextRouter.push("/")
        },
      },
    })
  }

  return (
    <>
      {/* Language */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-medium">{t("language")}</h2>
          <p className="text-sm text-muted-foreground">{t("languageDesc")}</p>
        </div>
        <Select value={locale} onValueChange={onLocaleChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {routing.locales.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {tLocale(loc)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <Separator />

      {/* Theme */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-medium">{t("theme")}</h2>
          <p className="text-sm text-muted-foreground">{t("themeDesc")}</p>
        </div>
        {mounted ? (
          <div className="flex gap-2">
            {themeOptions.map(({ value, icon: Icon, labelKey }) => (
              <Button
                key={value}
                variant={theme === value ? "default" : "outline"}
                className="gap-2"
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
                className="h-9 w-24 animate-pulse rounded-md bg-muted"
              />
            ))}
          </div>
        )}
      </section>

      <Separator />

      {/* Account */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-medium">{t("account")}</h2>
          <p className="text-sm text-muted-foreground">{t("accountDesc")}</p>
        </div>
        <Button variant="destructive" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          {t("logout")}
        </Button>
      </section>
    </>
  )
}
