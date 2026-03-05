import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Camera, Receipt, BarChart3 } from 'lucide-react'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function LandingPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  // If already signed in, go straight to dashboard
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (session) {
    redirect('/dashboard')
  }

  return <Landing />
}

function Landing() {
  const t = useTranslations('Landing')

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="text-xl font-semibold tracking-tight">CartSense</span>
        <Link href="/auth">
          <Button variant="outline" size="sm">{t('signIn')}</Button>
        </Link>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="max-w-lg space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <Link href="/auth">
          <Button size="lg" className="text-base">
            {t('getStarted')}
          </Button>
        </Link>

        {/* Feature highlights */}
        <div className="mt-8 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-2 rounded-lg border p-6">
            <Camera className="h-8 w-8 text-primary" />
            <h3 className="font-medium">{t('featureCapture')}</h3>
            <p className="text-sm text-muted-foreground">{t('featureCaptureDesc')}</p>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-lg border p-6">
            <Receipt className="h-8 w-8 text-primary" />
            <h3 className="font-medium">{t('featureOrganize')}</h3>
            <p className="text-sm text-muted-foreground">{t('featureOrganizeDesc')}</p>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-lg border p-6">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h3 className="font-medium">{t('featureInsights')}</h3>
            <p className="text-sm text-muted-foreground">{t('featureInsightsDesc')}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
