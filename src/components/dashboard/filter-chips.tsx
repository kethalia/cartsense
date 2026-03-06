"use client"

import { X } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { CategoryChip } from "@/components/receipt/category-chip"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface FilterState {
  query: string
  categoryId: string | null
  categoryName: string | null
  categoryNameRo: string | null
  categoryColor: string | null
  categoryIcon: string | null
  dateFrom: string | null
  dateTo: string | null
  amountMin: number | null
  amountMax: number | null
}

export const EMPTY_FILTERS: FilterState = {
  query: "",
  categoryId: null,
  categoryName: null,
  categoryNameRo: null,
  categoryColor: null,
  categoryIcon: null,
  dateFrom: null,
  dateTo: null,
  amountMin: null,
  amountMax: null,
}

interface Props {
  filters: FilterState
  onRemoveFilter: (key: keyof FilterState) => void
  onClearAll: () => void
}

export function hasActiveFilters(filters: FilterState): boolean {
  return !!(
    filters.query ||
    filters.categoryId ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.amountMin !== null ||
    filters.amountMax !== null
  )
}

export function FilterChips({ filters, onRemoveFilter, onClearAll }: Props) {
  const locale = useLocale()
  const t = useTranslations("Search")

  const chips: {
    key: keyof FilterState
    label: string
    node?: React.ReactNode
  }[] = []

  // Category chip
  if (filters.categoryId && filters.categoryName) {
    chips.push({
      key: "categoryId",
      label: "",
      node: (
        <CategoryChip
          category={{
            name: filters.categoryName,
            nameRo: filters.categoryNameRo,
            color: filters.categoryColor ?? "#6B7280",
            icon: filters.categoryIcon,
          }}
          size="sm"
        />
      ),
    })
  }

  // Date range chip
  if (filters.dateFrom || filters.dateTo) {
    const formatDate = (d: string) =>
      new Date(d + "T00:00:00").toLocaleDateString(
        locale === "ro" ? "ro-RO" : "en-US",
        { month: "short", day: "numeric" },
      )

    let label = ""
    if (filters.dateFrom && filters.dateTo) {
      label = `${formatDate(filters.dateFrom)} – ${formatDate(filters.dateTo)}`
    } else if (filters.dateFrom) {
      label = `${t("from")} ${formatDate(filters.dateFrom)}`
    } else if (filters.dateTo) {
      label = `${t("to")} ${formatDate(filters.dateTo)}`
    }
    chips.push({ key: "dateFrom", label })
  }

  // Amount range chip
  if (filters.amountMin !== null || filters.amountMax !== null) {
    const fmt = (n: number) =>
      new Intl.NumberFormat(locale === "ro" ? "ro-RO" : "en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(n)

    let label = ""
    if (filters.amountMin !== null && filters.amountMax !== null) {
      label = `${fmt(filters.amountMin)}–${fmt(filters.amountMax)} RON`
    } else if (filters.amountMin !== null) {
      label = `${t("min")} ${fmt(filters.amountMin)} RON`
    } else if (filters.amountMax !== null) {
      label = `${t("max")} ${fmt(filters.amountMax)} RON`
    }
    chips.push({ key: "amountMin", label })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted/50 px-2.5 py-1 text-xs font-medium",
          )}
        >
          {chip.node ?? chip.label}
          <button
            type="button"
            onClick={() => {
              if (chip.key === "dateFrom") {
                onRemoveFilter("dateFrom")
                onRemoveFilter("dateTo")
              } else if (chip.key === "amountMin") {
                onRemoveFilter("amountMin")
                onRemoveFilter("amountMax")
              } else {
                onRemoveFilter(chip.key)
              }
            }}
            className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-muted"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">{t("clearAll")}</span>
          </button>
        </span>
      ))}

      {chips.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-7 px-2 text-xs text-muted-foreground"
        >
          {t("clearAll")}
        </Button>
      )}
    </div>
  )
}
