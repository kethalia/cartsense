import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { v4 as uuidv4 } from "uuid"
import { VerificationClient } from "@/components/receipt/verification-client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import type { ExtractedLineItem, PaymentType, ReceiptImage } from "@/schemas"

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
    redirect("/auth")
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
      rawExtraction: true,
      verifiedAt: true,
    },
  })

  if (!receipt) {
    notFound()
  }

  const hasExtractionData =
    receipt.extractionStatus === "completed" && receipt.vendorName

  const image: ReceiptImage = {
    imageData: receipt.imageData,
    mimeType: receipt.mimeType,
  }

  return (
    <VerificationClient
      receiptId={id}
      image={image}
      existingData={
        hasExtractionData
          ? {
              vendorName: receipt.vendorName ?? "",
              totalAmount:
                receipt.totalAmount !== null ? String(receipt.totalAmount) : "",
              receiptDate: receipt.receiptDate
                ? receipt.receiptDate.toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
              taxAmount:
                receipt.taxAmount !== null ? String(receipt.taxAmount) : "",
              paymentType: (receipt.paymentType as PaymentType) ?? "",
              lineItems: (
                (receipt.rawExtraction as { lineItems?: ExtractedLineItem[] })
                  ?.lineItems ?? []
              ).map((i) => ({
                id: uuidv4(),
                name: i.name,
                quantity: String(i.quantity),
                unitPrice: String(i.unitPrice),
              })),
            }
          : undefined
      }
    />
  )
}
