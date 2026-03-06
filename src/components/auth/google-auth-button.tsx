"use client"

import { SiGoogle } from "@icons-pack/react-simple-icons"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export function GoogleAuthButton() {
  const t = useTranslations("Auth")
  const [isLoading, setIsLoading] = React.useState(false)

  async function handleClick() {
    setIsLoading(true)

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      })
    } catch {
      // Redirect will happen, loading state handles UX
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <SiGoogle className="size-4" />
      )}
      {t("continueWithGoogle")}
    </Button>
  )
}
