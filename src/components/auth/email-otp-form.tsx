'use client'

import * as React from 'react'
import { useSignIn, useSignUp } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Loader2 } from 'lucide-react'

type Step = 'email' | 'code'
type FlowType = 'signIn' | 'signUp'

export function EmailOTPForm() {
  const t = useTranslations('Auth')
  const { signIn, fetchStatus: signInFetchStatus } = useSignIn()
  const { signUp, fetchStatus: signUpFetchStatus } = useSignUp()

  const [step, setStep] = React.useState<Step>('email')
  const [email, setEmail] = React.useState('')
  const [code, setCode] = React.useState('')
  const [flowType, setFlowType] = React.useState<FlowType>('signIn')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const isFetching = signInFetchStatus === 'fetching' || signUpFetchStatus === 'fetching'

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!signIn || !signUp) return

    setIsLoading(true)
    setError(null)

    try {
      // Try sign-in first (existing user)
      const createResult = await signIn.create({ identifier: email })

      if (createResult.error) {
        // If user doesn't exist, try sign-up
        const errorCode = (createResult.error as { code?: string }).code
        const isNotFound =
          errorCode === 'form_identifier_not_found' ||
          errorCode === 'identifier_not_found'

        if (isNotFound) {
          await handleSignUpFlow()
          return
        }

        const errorMsg = (createResult.error as { message?: string }).message
        setError(errorMsg ?? t('genericError'))
        return
      }

      // User exists, send email code
      if (signIn.status === 'needs_first_factor') {
        const sendResult = await signIn.emailCode.sendCode()
        if (sendResult.error) {
          const errorMsg = (sendResult.error as { message?: string }).message
          setError(errorMsg ?? t('genericError'))
          return
        }
        setFlowType('signIn')
        setStep('code')
      }
    } catch {
      setError(t('genericError'))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSignUpFlow() {
    if (!signUp) return

    try {
      const createResult = await signUp.create({ emailAddress: email })
      if (createResult.error) {
        const errorMsg = (createResult.error as { message?: string }).message
        setError(errorMsg ?? t('genericError'))
        return
      }

      const sendResult = await signUp.verifications.sendEmailCode()
      if (sendResult.error) {
        const errorMsg = (sendResult.error as { message?: string }).message
        setError(errorMsg ?? t('genericError'))
        return
      }

      setFlowType('signUp')
      setStep('code')
    } catch {
      setError(t('genericError'))
    }
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!signIn || !signUp) return

    setIsLoading(true)
    setError(null)

    try {
      if (flowType === 'signIn') {
        const verifyResult = await signIn.emailCode.verifyCode({ code })
        if (verifyResult.error) {
          const errorMsg = (verifyResult.error as { message?: string }).message
          setError(errorMsg ?? t('invalidCode'))
          return
        }

        if (signIn.status === 'complete') {
          await signIn.finalize({
            navigate: ({ decorateUrl }) => {
              window.location.href = decorateUrl('/dashboard')
            },
          })
        }
      } else {
        const verifyResult = await signUp.verifications.verifyEmailCode({ code })
        if (verifyResult.error) {
          const errorMsg = (verifyResult.error as { message?: string }).message
          setError(errorMsg ?? t('invalidCode'))
          return
        }

        if (signUp.status === 'complete') {
          await signUp.finalize({
            navigate: ({ decorateUrl }) => {
              window.location.href = decorateUrl('/dashboard')
            },
          })
        }
      }
    } catch {
      setError(t('invalidCode'))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResendCode() {
    if (!signIn || !signUp) return

    setIsLoading(true)
    setError(null)

    try {
      if (flowType === 'signIn') {
        const result = await signIn.emailCode.sendCode()
        if (result.error) {
          const errorMsg = (result.error as { message?: string }).message
          setError(errorMsg ?? t('genericError'))
        }
      } else {
        const result = await signUp.verifications.sendEmailCode()
        if (result.error) {
          const errorMsg = (result.error as { message?: string }).message
          setError(errorMsg ?? t('genericError'))
        }
      }
    } catch {
      setError(t('genericError'))
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'email') {
    return (
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t('email')}
          </label>
          <Input
            id="email"
            type="email"
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || isFetching || !signIn}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" />
              {t('sending')}
            </>
          ) : (
            t('continue')
          )}
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={handleCodeSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">
          {t('enterCode')}
        </label>
        <p className="text-sm text-muted-foreground">
          {t('codeSent', { email })}
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

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || code.length !== 6}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            {t('verifying')}
          </>
        ) : (
          t('verify')
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResendCode}
          disabled={isLoading}
          className="text-sm text-muted-foreground underline-offset-4 hover:underline hover:text-foreground transition-colors disabled:opacity-50"
        >
          {t('resendCode')}
        </button>
      </div>
    </form>
  )
}
