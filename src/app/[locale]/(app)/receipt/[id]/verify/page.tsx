import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { VerificationClient } from '@/components/receipt/verification-client'

type Props = {
  params: Promise<{ locale: string; id: string }>
}

export default async function ReceiptVerifyPage({ params }: Props) {
  const { locale, id } = await params
  setRequestLocale(locale)

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/auth')
  }

  const receipt = await prisma.capturedReceipt.findUnique({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      imageData: true,
      mimeType: true,
      verifiedAt: true,
    },
  })

  if (!receipt) {
    notFound()
  }

  // Already verified — redirect to dashboard
  if (receipt.verifiedAt) {
    redirect('/dashboard')
  }

  return (
    <VerificationClient
      receiptId={id}
      imageData={receipt.imageData}
      mimeType={receipt.mimeType}
    />
  )
}
