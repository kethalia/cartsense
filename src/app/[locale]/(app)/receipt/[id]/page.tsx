import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ReceiptDetails } from '@/components/receipt/receipt-details'
import type { ExtractedLineItem } from '@/schemas'

type Props = {
  params: Promise<{ locale: string; id: string }>
}

export default async function ReceiptDetailsPage({ params }: Props) {
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
      vendorName: true,
      totalAmount: true,
      receiptDate: true,
      taxAmount: true,
      paymentType: true,
      rawExtraction: true,
      capturedAt: true,
      verifiedAt: true,
    },
  })

  if (!receipt) {
    notFound()
  }

  return (
    <ReceiptDetails
      id={id}
      imageData={receipt.imageData}
      mimeType={receipt.mimeType}
      vendorName={receipt.vendorName}
      totalAmount={receipt.totalAmount ? Number(receipt.totalAmount) : null}
      receiptDate={receipt.receiptDate}
      taxAmount={receipt.taxAmount ? Number(receipt.taxAmount) : null}
      paymentType={receipt.paymentType}
      capturedAt={receipt.capturedAt}
      verifiedAt={receipt.verifiedAt}
      lineItems={(receipt.rawExtraction as { lineItems?: ExtractedLineItem[] })?.lineItems ?? []}
    />
  )
}
