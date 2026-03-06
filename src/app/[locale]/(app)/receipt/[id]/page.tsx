import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ReceiptDetails } from "@/components/receipt/receipt-details";
import type { ExtractedLineItem, PaymentType, Receipt } from "@/schemas";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ReceiptDetailsPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth");
  }

  const row = await prisma.capturedReceipt.findUnique({
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
  });

  if (!row) {
    notFound();
  }

  const receipt: Receipt = {
    ...row,
    totalAmount: row.totalAmount ? Number(row.totalAmount) : null,
    taxAmount: row.taxAmount ? Number(row.taxAmount) : null,
    paymentType: row.paymentType as PaymentType | null,
    lineItems:
      (row.rawExtraction as { lineItems?: ExtractedLineItem[] })?.lineItems ??
      [],
  };

  return <ReceiptDetails receipt={receipt} />;
}
