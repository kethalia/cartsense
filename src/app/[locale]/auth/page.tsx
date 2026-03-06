import { setRequestLocale } from "next-intl/server"
import { AuthScreen } from "@/components/auth/auth-screen"

type Props = {
  params: Promise<{ locale: string }>
}

export default async function AuthPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <AuthScreen />
    </div>
  )
}
