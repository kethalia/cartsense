"use client"

import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { authClient } from "@/lib/auth-client"

type Step = "email" | "code"

export function EmailOTPForm() {
  const t = useTranslations("Auth")
  const router = useRouter()

  const [step, setStep] = React.useState<Step>("email")
  const [email, setEmail] = React.useState("")
  const [code, setCode] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error: sendError } =
        await authClient.emailOtp.sendVerificationOtp({
          email,
          type: "sign-in",
        })

      if (sendError) {
        setError(sendError.message ?? t("genericError"))
        return
      }

      setStep("code")
    } catch {
      setError(t("genericError"))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error: verifyError } = await authClient.signIn.emailOtp({
        email,
        otp: code,
      })

      if (verifyError) {
        setError(verifyError.message ?? t("invalidCode"))
        return
      }

      // Sign-in successful — redirect to dashboard
      router.push("/dashboard")
    } catch {
      setError(t("invalidCode"))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResendCode() {
    setIsLoading(true)
    setError(null)

    try {
      const { error: resendError } =
        await authClient.emailOtp.sendVerificationOtp({
          email,
          type: "sign-in",
        })

      if (resendError) {
        setError(resendError.message ?? t("genericError"))
      }
    } catch {
      setError(t("genericError"))
    } finally {
      setIsLoading(false)
    }
  }

  if (step === "email") {
    return (
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("email")}
          </label>
          <Input
            id="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" />
              {t("sending")}
            </>
          ) : (
            t("continue")
          )}
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={handleCodeSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">
          {t("enterCode")}
        </label>
        <p className="text-sm text-muted-foreground">
          {t("codeSent", { email })}
        </p>
        <div className="flex justify-center pt-2">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(value) => setCode(value)}
            autoFocus
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || code.length !== 6}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            {t("verifying")}
          </>
        ) : (
          t("verify")
        )}
      </Button>

      <Button
        type="button"
        variant="link"
        size="sm"
        className="w-full text-muted-foreground"
        onClick={handleResendCode}
        disabled={isLoading}
      >
        {t("resendCode")}
      </Button>
    </form>
  )
}
