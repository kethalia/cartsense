"use client"

import { Lock, Pencil, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/actions/category"
import type { CategoryType } from "@/schemas"

const COLOR_PALETTE = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#14B8A6",
  "#06B6D4",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#D946EF",
  "#EC4899",
  "#F43F5E",
  "#0EA5E9",
  "#10B981",
  "#6B7280",
]

interface CategoryItem {
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
}

interface Props {
  initialCategories: CategoryItem[]
}

interface FormState {
  name: string
  nameRo: string
  color: string
  type: CategoryType
  icon: string
}

const EMPTY_FORM: FormState = {
  name: "",
  nameRo: "",
  color: "#6B7280",
  type: "receipt",
  icon: "",
}

export function CategoryManager({ initialCategories }: Props) {
  const t = useTranslations("CategorySettings")
  const locale = useLocale()
  const isMobile = useIsMobile()
  const router = useRouter()

  const [categories, setCategories] = useState(initialCategories)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState<CategoryItem | null>(null)

  const { executeAsync: executeCreate, isExecuting: isCreating } = useAction(
    createCategory,
    {
      onSuccess: ({ data }) => {
        if (data?.category) {
          setCategories((prev) => [...prev, data.category as CategoryItem])
          toast.success(t("saved"))
          setFormOpen(false)
          router.refresh()
        }
      },
      onError: ({ error }) => {
        toast.error(String(error.serverError ?? "Failed to save"))
      },
    },
  )

  const { executeAsync: executeUpdate, isExecuting: isUpdating } = useAction(
    updateCategory,
    {
      onSuccess: ({ data }) => {
        if (data?.category) {
          setCategories((prev) =>
            prev.map((c) =>
              c.id === data.category.id ? (data.category as CategoryItem) : c,
            ),
          )
          toast.success(t("saved"))
          setFormOpen(false)
          setEditingId(null)
          router.refresh()
        }
      },
      onError: ({ error }) => {
        toast.error(String(error.serverError ?? "Failed to save"))
      },
    },
  )

  const { executeAsync: executeDelete, isExecuting: isDeleting } = useAction(
    deleteCategory,
    {
      onSuccess: () => {
        if (deleteConfirm) {
          setCategories((prev) => prev.filter((c) => c.id !== deleteConfirm.id))
        }
        toast.success(t("deleted"))
        setDeleteConfirm(null)
        router.refresh()
      },
      onError: ({ error }) => {
        toast.error(String(error.serverError ?? "Failed to delete"))
      },
    },
  )

  const receiptCategories = categories.filter((c) => c.type === "receipt")
  const productCategories = categories.filter((c) => c.type === "product")

  function getCategoryLabel(cat: CategoryItem) {
    return locale === "ro" && cat.nameRo ? cat.nameRo : cat.name
  }

  function handleAdd() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  function handleEdit(cat: CategoryItem) {
    setEditingId(cat.id)
    setForm({
      name: cat.name,
      nameRo: cat.nameRo ?? "",
      color: cat.color,
      type: cat.type as CategoryType,
      icon: cat.icon ?? "",
    })
    setFormOpen(true)
  }

  async function handleSave() {
    if (editingId) {
      await executeUpdate({
        id: editingId,
        name: form.name || undefined,
        nameRo: form.nameRo || undefined,
        color: form.color || undefined,
        icon: form.icon || undefined,
      })
    } else {
      await executeCreate({
        name: form.name,
        type: form.type,
        color: form.color || undefined,
        icon: form.icon || undefined,
      })
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return
    await executeDelete({ id: deleteConfirm.id })
  }

  function renderCategoryList(cats: CategoryItem[], title: string) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-medium">{title}</h2>
        <div className="space-y-1">
          {cats.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-accent/50"
            >
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="flex-1 truncate text-sm">
                {getCategoryLabel(cat)}
              </span>
              {cat.isCustom ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleEdit(cat)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="sr-only">{t("editCategory")}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => setDeleteConfirm(cat)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">{t("deleteCategory")}</span>
                  </Button>
                </div>
              ) : (
                <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
              )}
            </div>
          ))}
        </div>
      </section>
    )
  }

  const formContent = (
    <div className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="cat-name">{t("name")}</Label>
        <Input
          id="cat-name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Groceries"
        />
      </div>

      {/* Romanian name */}
      <div className="space-y-2">
        <Label htmlFor="cat-name-ro">{t("nameRo")}</Label>
        <Input
          id="cat-name-ro"
          value={form.nameRo}
          onChange={(e) => setForm((f) => ({ ...f, nameRo: e.target.value }))}
          placeholder="ex. Cumpărături"
        />
      </div>

      {/* Type (only for new categories) */}
      {!editingId && (
        <div className="space-y-2">
          <Label>{t("type")}</Label>
          <Select
            value={form.type}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, type: v as CategoryType }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="receipt">{t("receipt")}</SelectItem>
              <SelectItem value="product">{t("product")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Color picker */}
      <div className="space-y-2">
        <Label>{t("color")}</Label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setForm((f) => ({ ...f, color }))}
              className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: color,
                borderColor:
                  form.color === color ? "currentColor" : "transparent",
              }}
            >
              <span className="sr-only">{color}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const formTitle = editingId ? t("editCategory") : t("addCategory")
  const isSaving = isCreating || isUpdating

  return (
    <>
      {/* Category lists */}
      {renderCategoryList(receiptCategories, t("receiptCategories"))}

      <Separator />

      {renderCategoryList(productCategories, t("productCategories"))}

      <Separator />

      {/* Add button */}
      <Button onClick={handleAdd} className="gap-2">
        <Plus className="h-4 w-4" />
        {t("addCategory")}
      </Button>

      {/* Add/Edit form */}
      {isMobile ? (
        <Drawer open={formOpen} onOpenChange={setFormOpen}>
          <DrawerContent className="px-4 pb-6">
            <DrawerHeader className="px-0">
              <DrawerTitle>{formTitle}</DrawerTitle>
            </DrawerHeader>
            {formContent}
            <DrawerFooter className="flex-row gap-2 px-0">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setFormOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={!form.name.trim() || isSaving}
              >
                {t("save")}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{formTitle}</DialogTitle>
            </DialogHeader>
            {formContent}
            <DialogFooter>
              <Button variant="outline" onClick={() => setFormOpen(false)}>
                {t("cancel")}
              </Button>
              <Button
                onClick={handleSave}
                disabled={!form.name.trim() || isSaving}
              >
                {t("save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirmation */}
      {isMobile ? (
        <Drawer
          open={!!deleteConfirm}
          onOpenChange={(open) => !open && setDeleteConfirm(null)}
        >
          <DrawerContent className="px-4 pb-6">
            <DrawerHeader className="px-0">
              <DrawerTitle>
                {deleteConfirm
                  ? t("deleteConfirm", {
                      name: getCategoryLabel(deleteConfirm),
                    })
                  : ""}
              </DrawerTitle>
            </DrawerHeader>
            <p className="text-sm text-muted-foreground">
              {t("deleteMessage")}
            </p>
            <DrawerFooter className="flex-row gap-2 px-0">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteConfirm(null)}
              >
                {t("cancel")}
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {t("deleteCategory")}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog
          open={!!deleteConfirm}
          onOpenChange={(open) => !open && setDeleteConfirm(null)}
        >
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>
                {deleteConfirm
                  ? t("deleteConfirm", {
                      name: getCategoryLabel(deleteConfirm),
                    })
                  : ""}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              {t("deleteMessage")}
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                {t("cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {t("deleteCategory")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
