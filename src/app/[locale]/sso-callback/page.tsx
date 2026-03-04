'use client'

import { HandleSSOCallback } from '@clerk/react'
import { useRouter } from 'next/navigation'

export default function SSOCallbackPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center">
      <HandleSSOCallback
        navigateToApp={({ decorateUrl }) => {
          const url = decorateUrl('/')
          if (url.startsWith('http')) {
            window.location.href = url
            return
          }
          router.push(url)
        }}
        navigateToSignIn={() => {
          router.push('/auth')
        }}
        navigateToSignUp={() => {
          router.push('/auth')
        }}
      />
    </div>
  )
}
