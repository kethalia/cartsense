import { currentUser } from '@clerk/nextjs/server'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SettingsControls } from '@/components/settings/settings-controls'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('Settings')
  const user = await currentUser()

  const displayName = user?.fullName || ''
  const displayEmail = user?.primaryEmailAddress?.emailAddress || ''
  const avatarUrl = user?.imageUrl || ''
  const initials = displayName
    ? displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : displayEmail.slice(0, 2).toUpperCase()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('profile')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarUrl} alt={displayName || displayEmail} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              {displayName && (
                <p className="truncate text-lg font-medium">{displayName}</p>
              )}
              <p className="truncate text-sm text-muted-foreground">{displayEmail}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client-side controls: language, theme, logout */}
      <SettingsControls />
    </div>
  )
}
