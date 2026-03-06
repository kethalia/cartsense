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
      extractionStatus: true,
      vendorName: true,
      totalAmount: true,
      receiptDate: true,
      taxAmount: true,
      paymentType: true,
      confidence: true,
      rawExtraction: true,
      verifiedAt: true,
    },
  })

  if (!receipt) {
    notFound()
  }

  // Determine mode: edit if already verified or has extraction data, verify if fresh
  const hasExtractionData = receipt.extractionStatus === 'completed' && receipt.vendorName
  const mode = receipt.verifiedAt || hasExtractionData ? 'edit' : 'verify'

  return (
    <div className="p-4 md:p-6">
      <VerificationClient
        receiptId={id}
        imageData={receipt.imageData}
        mimeType={receipt.mimeType}
        mode={mode}
        existingData={
          hasExtractionData
            ? {
                vendorName: receipt.vendorName ?? '',
                totalAmount: receipt.totalAmount !== null ? String(receipt.totalAmount) : '',
                receiptDate: receipt.receiptDate
                  ? receipt.receiptDate.toISOString().split('T')[0]
                  : new Date().toISOString().split('T')[0],
                taxAmount: receipt.taxAmount !== null ? String(receipt.taxAmount) : '',
                paymentType: (receipt.paymentType as 'cash' | 'card' | 'other') ?? '',
                confidence: receipt.confidence ?? undefined,
                lineItems: extractLineItems(receipt.rawExtraction),
              }
            : undefined
        }
      />
    </div>
  )
}

/** Extract line items from rawExtraction JSON (either verified or raw AI output) */
function extractLineItems(
  raw: unknown
): { name: string; quantity: string; unitPrice: string }[] {
  if (!raw || typeof raw !== 'object') return []

  const obj = raw as Record<string, unknown>

  // Verified format: { verified: true, lineItems: [...] }
  if (obj.verified && Array.isArray(obj.lineItems)) {
    return (obj.lineItems as { name: string; quantity: number; unitPrice: number }[]).map((i) => ({
      name: i.name ?? '',
      quantity: String(i.quantity ?? 1),
      unitPrice: String(i.unitPrice ?? 0),
    }))
  }

  // Raw AI format: { items: [{ name, quantity, unit_price, total_price }] }
  if (Array.isArray(obj.items)) {
    return (obj.items as { name: string; quantity: number; unit_price: number }[]).map((i) => ({
      name: i.name ?? '',
      quantity: String(i.quantity ?? 1),
      unitPrice: String(i.unit_price ?? 0),
    }))
  }

  return []
}
