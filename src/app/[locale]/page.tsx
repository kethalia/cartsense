import { setRequestLocale } from 'next-intl/server'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">CartSense</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Receipt intelligence for the Romanian market
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Locale: {locale}
      </p>
    </main>
  )
}
