"use client"

import { Check, Plus, Search } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"
import { createCategory, getCategories } from "@/lib/actions/category"
import { updateReceiptCategory } from "@/lib/actions/receipt-list"
import type { Category, CategoryType } from "@/schemas"

const DEFAULT_COLORS = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#14B8A6",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#6B7280",
  "#0EA5E9",
  "#D946EF",
  "#F43F5E",
]

interface Props {
  receiptId: string
  currentCategory: Category | null
  type: CategoryType
  onCategoryChange: (category: Category) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoryPicker({
  receiptId,
  currentCategory,
  type,
  onCategoryChange,
  open,
  onOpenChange,
}: Props) {
  const isMobile = useIsMobile()
  const locale = useLocale()
  const t = useTranslations("Categories")

  const [search, setSearch] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  const { executeAsync: executeUpdate } = useAction(updateReceiptCategory, {
    onSuccess: () => {
      toast.success(t("updated"))
    },
    onError: ({ error }) => {
      toast.error(String(error.serverError ?? "Failed to update category"))
    },
  })

  const { executeAsync: executeCreate } = useAction(createCategory, {
    onSuccess: () => {
      toast.success(t("created"))
    },
    onError: ({ error }) => {
      toast.error(String(error.serverError ?? "Failed to create category"))
    },
  })

  const { executeAsync: executeGetCategories } = useAction(getCategories)

  // Load categories when picker opens
  useEffect(() => {
    if (!open) return

    setLoading(true)
    setSearch("")

    executeGetCategories({ type })
      .then((result) => {
        if (result?.data?.categories) {
          setCategories(result.data.categories as Category[])
        }
      })
      .finally(() => setLoading(false))
  }, [open, type, executeGetCategories])

  const filteredCategories = categories.filter((cat) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      cat.name.toLowerCase().includes(searchLower) ||
      (cat.nameRo && cat.nameRo.toLowerCase().includes(searchLower))
    )
  })

  const systemCategories = filteredCategories.filter((c) => !c.isCustom)
  const customCategories = filteredCategories.filter((c) => c.isCustom)

  const showCreateOption =
    search.trim() &&
    !categories.some(
      (c) => c.name.toLowerCase() === search.trim().toLowerCase(),
    )

  async function handleSelect(category: Category) {
    await executeUpdate({ receiptId, categoryId: category.id })
    onCategoryChange(category)
    onOpenChange(false)
  }

  async function handleCreate() {
    const name = search.trim()
    if (!name) return

    const colorIndex = categories.length % DEFAULT_COLORS.length
    const color = DEFAULT_COLORS[colorIndex]

    const result = await executeCreate({ name, type, color })
    if (result?.data?.category) {
      const newCategory = result.data.category as Category
      await executeUpdate({ receiptId, categoryId: newCategory.id })
      onCategoryChange(newCategory)
      onOpenChange(false)
    }
  }

  function getCategoryLabel(cat: Category) {
    return locale === "ro" && cat.nameRo ? cat.nameRo : cat.name
  }

  const content = (
    <div className="flex max-h-[60vh] flex-col">
      {/* Search input */}
      <div className="relative px-1 pb-3">
        <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchOrCreate")}
          className="pl-9"
          autoFocus
        />
      </div>

      {/* Category list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            ...
          </div>
        ) : (
          <>
            {/* System categories */}
            {systemCategories.length > 0 && (
              <div>
                <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {t("system")}
                </p>
                {systemCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelect(cat)}
                    className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="flex-1 text-left">
                      {getCategoryLabel(cat)}
                    </span>
                    {currentCategory?.id === cat.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Custom categories */}
            {customCategories.length > 0 && (
              <div>
                {systemCategories.length > 0 && <Separator className="my-2" />}
                <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {t("custom")}
                </p>
                {customCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelect(cat)}
                    className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="flex-1 text-left">
                      {getCategoryLabel(cat)}
                    </span>
                    {currentCategory?.id === cat.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* No matches */}
            {filteredCategories.length === 0 && !showCreateOption && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t("noMatches")}
              </p>
            )}

            {/* Create new */}
            {showCreateOption && (
              <>
                <Separator className="my-2" />
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={handleCreate}
                >
                  <Plus className="h-4 w-4" />
                  {t("createNew", { name: search.trim() })}
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="px-4 pb-6">
          <DrawerHeader className="px-0">
            <DrawerTitle>{t("selectCategory")}</DrawerTitle>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("selectCategory")}</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
