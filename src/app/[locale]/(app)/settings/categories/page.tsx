import { headers } from "next/headers"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { CategoryManager } from "@/components/settings/category-manager"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

type Props = {
  params: Promise<{ locale: string }>
}

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations("CategorySettings")
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const userId = session?.user?.id

  let categories: {
    id: string
    name: string
    nameRo: string | null
    slug: string
    type: string
    color: string
    icon: string | null
    isCustom: boolean
    userId: string | null
    sortOrder: number
  }[] = []

  if (userId) {
    categories = await prisma.category.findMany({
      where: {
        OR: [{ userId: null }, { userId }],
      },
      orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        nameRo: true,
        slug: true,
        type: true,
        color: true,
        icon: true,
        isCustom: true,
        userId: true,
        sortOrder: true,
      },
    })
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <CategoryManager initialCategories={categories} />
    </div>
  )
}
