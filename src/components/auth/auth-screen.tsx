'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { useIsMobile } from '@/hooks/use-mobile'
import { EmailOTPForm } from '@/components/auth/email-otp-form'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

function AuthContent() {
  const t = useTranslations('Auth')

  return (
    <div className="space-y-6">
      <EmailOTPForm />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t('or')}
          </span>
        </div>
      </div>

      <GoogleAuthButton />
    </div>
  )
}

export function AuthScreen() {
  const t = useTranslations('Auth')
  const isMobile = useIsMobile()

  // Render nothing during SSR / before hydration to avoid mismatch
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return null
  }

  if (isMobile) {
    return (
      <Drawer open dismissible={false}>
        <DrawerContent>
          <DrawerHeader className="text-center">
            <DrawerTitle className="text-2xl font-bold">
              CartSense
            </DrawerTitle>
            <DrawerDescription>
              {t('tagline')}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-8">
            <AuthContent />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="sm:max-w-md"
      >
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-2xl font-bold">
            CartSense
          </DialogTitle>
          <DialogDescription>
            {t('tagline')}
          </DialogDescription>
        </DialogHeader>
        <AuthContent />
      </DialogContent>
    </Dialog>
  )
}
