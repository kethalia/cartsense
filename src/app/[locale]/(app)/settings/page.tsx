import { headers } from "next/headers"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { SettingsControls } from "@/components/settings/settings-controls"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { auth } from "@/lib/auth"

type Props = {
  params: Promise<{ locale: string }>
}

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations("Settings")
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const user = session?.user
  const displayName = user?.name || ""
  const displayEmail = user?.email || ""
  const avatarUrl = user?.image || ""
  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : displayEmail.slice(0, 2).toUpperCase()

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      {/* Profile */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-medium">{t("profile")}</h2>
          <p className="text-sm text-muted-foreground">{t("profileDesc")}</p>
        </div>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatarUrl} alt={displayName || displayEmail} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            {displayName && (
              <p className="truncate text-sm font-medium">{displayName}</p>
            )}
            <p className="truncate text-sm text-muted-foreground">
              {displayEmail}
            </p>
          </div>
        </div>
      </section>

      <Separator />

      <SettingsControls />
    </div>
  )
}
