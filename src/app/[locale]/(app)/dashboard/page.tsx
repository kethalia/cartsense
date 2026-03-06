import { headers } from "next/headers"
import { setRequestLocale, getTranslations } from "next-intl/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ReceiptCard } from "@/components/dashboard/receipt-card"
import { CaptureFlow } from "@/components/capture/capture-flow"
import { ItemGroup } from "@/components/ui/item"
import type { ReceiptSummary } from "@/schemas"

type Props = {
  params: Promise<{ locale: string }>
}

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations("Dashboard")
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const userId = session?.user?.id

  let receipts: ReceiptSummary[] = []

  if (userId) {
    try {
      receipts = await prisma.capturedReceipt.findMany({
        where: { userId },
        orderBy: { capturedAt: "desc" },
        select: {
          id: true,
          imageData: true,
          mimeType: true,
          fileSize: true,
          capturedAt: true,
        },
      })
    } catch {
      // User may not exist in DB yet — that's fine, show empty state
    }
  }

  const hasReceipts = receipts.length > 0

  return (
    <div className="relative">
      {hasReceipts ? (
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">{t("receipts")}</h1>
          <ItemGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {receipts.map((receipt) => (
              <ReceiptCard key={receipt.id} receipt={receipt} />
            ))}
          </ItemGroup>
        </div>
      ) : (
        <EmptyState />
      )}

      {/* Capture flow: FAB + camera + preview (only for signed-in users) */}
      {userId && <CaptureFlow />}
    </div>
  )
}
