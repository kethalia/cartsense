import { headers } from "next/headers"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { CaptureFlow } from "@/components/capture/capture-flow"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { EmptyState } from "@/components/dashboard/empty-state"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

interface Props {
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

  let receipts: {
    id: string
    vendorName: string | null
    totalAmount: number | null
    receiptDate: Date | null
    capturedAt: Date
    categoryId: string | null
    category: {
      id: string
      name: string
      nameRo: string | null
      slug: string
      color: string
      icon: string | null
    } | null
    imageData: string
    mimeType: string
  }[] = []

  if (userId) {
    try {
      const raw = await prisma.capturedReceipt.findMany({
        where: { userId },
        orderBy: { capturedAt: "desc" },
        select: {
          id: true,
          vendorName: true,
          totalAmount: true,
          receiptDate: true,
          capturedAt: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true,
              nameRo: true,
              slug: true,
              color: true,
              icon: true,
            },
          },
          imageData: true,
          mimeType: true,
        },
      })

      receipts = raw.map((r) => ({
        ...r,
        totalAmount: r.totalAmount ? Number(r.totalAmount) : null,
      }))
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
          <DashboardContent receipts={receipts} />
        </div>
      ) : (
        <EmptyState />
      )}

      {/* Capture flow: FAB + camera + preview (only for signed-in users) */}
      {userId && <CaptureFlow />}
    </div>
  )
}
