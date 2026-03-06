"use client"

import {
  Calendar,
  DollarSign,
  Search,
  SlidersHorizontal,
  Tag,
  X,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  EMPTY_FILTERS,
  FilterChips,
  type FilterState,
  hasActiveFilters,
} from "@/components/dashboard/filter-chips"
import { CategoryChip } from "@/components/receipt/category-chip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useIsMobile } from "@/hooks/use-mobile"
import { getCategories } from "@/lib/actions/category"
import { searchReceipts } from "@/lib/actions/search-receipts"
import type { Category } from "@/schemas"
import type { ReceiptWithCategory } from "./receipt-list"

interface Props {
  onResults: (
    receipts: ReceiptWithCategory[] | null,
    matchContext: Record<string, { field: string; matchedText: string }[]>,
    isSearching: boolean,
  ) => void
}

export function ReceiptSearch({ onResults }: Props) {
  const t = useTranslations("Search")
  const isMobile = useIsMobile()
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { executeAsync: executeSearch } = useAction(searchReceipts)
  const { executeAsync: executeGetCategories } = useAction(getCategories)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)
  const [amountOpen, setAmountOpen] = useState(false)

  // Temp state for date/amount inputs
  const [tempDateFrom, setTempDateFrom] = useState("")
  const [tempDateTo, setTempDateTo] = useState("")
  const [tempAmountMin, setTempAmountMin] = useState("")
  const [tempAmountMax, setTempAmountMax] = useState("")

  // Load categories when category filter is opened
  useEffect(() => {
    if (!categoryOpen) return
    executeGetCategories({ type: "receipt" }).then((result) => {
      if (result?.data?.categories) {
        setCategories(result.data.categories as Category[])
      }
    })
  }, [categoryOpen, executeGetCategories])

  const performSearch = useCallback(
    async (currentFilters: FilterState) => {
      if (!hasActiveFilters(currentFilters)) {
        onResults(null, {}, false)
        return
      }

      onResults(null, {}, true)

      const result = await executeSearch({
        query: currentFilters.query || undefined,
        categoryId: currentFilters.categoryId || undefined,
        dateFrom: currentFilters.dateFrom || undefined,
        dateTo: currentFilters.dateTo || undefined,
        amountMin: currentFilters.amountMin ?? undefined,
        amountMax: currentFilters.amountMax ?? undefined,
      })

      if (result?.data) {
        onResults(
          result.data.receipts as ReceiptWithCategory[],
          result.data.matchContext,
          false,
        )
      } else {
        onResults([], {}, false)
      }
    },
    [executeSearch, onResults],
  )

  // Debounced search on query change
  const handleQueryChange = useCallback(
    (value: string) => {
      const newFilters = { ...filters, query: value }
      setFilters(newFilters)

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
        performSearch(newFilters)
      }, 300)
    },
    [filters, performSearch],
  )

  // Immediate search on filter change
  const applyFilter = useCallback(
    (patch: Partial<FilterState>) => {
      const newFilters = { ...filters, ...patch }
      setFilters(newFilters)
      performSearch(newFilters)
    },
    [filters, performSearch],
  )

  const handleRemoveFilter = useCallback(
    (key: keyof FilterState) => {
      const newFilters = { ...filters }
      if (key === "categoryId") {
        newFilters.categoryId = null
        newFilters.categoryName = null
        newFilters.categoryNameRo = null
        newFilters.categoryColor = null
        newFilters.categoryIcon = null
      } else if (key === "dateFrom" || key === "dateTo") {
        newFilters.dateFrom = null
        newFilters.dateTo = null
      } else if (key === "amountMin" || key === "amountMax") {
        newFilters.amountMin = null
        newFilters.amountMax = null
      } else {
        ;(newFilters as Record<string, unknown>)[key] = null
      }
      setFilters(newFilters)
      performSearch(newFilters)
    },
    [filters, performSearch],
  )

  const handleClearAll = useCallback(() => {
    setFilters(EMPTY_FILTERS)
    performSearch(EMPTY_FILTERS)
  }, [performSearch])

  const handleCategorySelect = useCallback(
    (cat: Category) => {
      applyFilter({
        categoryId: cat.id,
        categoryName: cat.name,
        categoryNameRo: cat.nameRo,
        categoryColor: cat.color,
        categoryIcon: cat.icon,
      })
      setCategoryOpen(false)
    },
    [applyFilter],
  )

  const handleDatePreset = useCallback(
    (preset: string) => {
      const today = new Date()
      const todayStr = today.toISOString().split("T")[0]
      let fromStr = todayStr

      switch (preset) {
        case "today":
          fromStr = todayStr
          break
        case "thisWeek": {
          const day = today.getDay()
          const diff = day === 0 ? 6 : day - 1
          const monday = new Date(today)
          monday.setDate(today.getDate() - diff)
          fromStr = monday.toISOString().split("T")[0]
          break
        }
        case "thisMonth":
          fromStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`
          break
        case "last30Days": {
          const past = new Date(today)
          past.setDate(today.getDate() - 30)
          fromStr = past.toISOString().split("T")[0]
          break
        }
      }

      applyFilter({ dateFrom: fromStr, dateTo: todayStr })
      setDateOpen(false)
    },
    [applyFilter],
  )

  const handleDateApply = useCallback(() => {
    applyFilter({
      dateFrom: tempDateFrom || null,
      dateTo: tempDateTo || null,
    })
    setDateOpen(false)
  }, [applyFilter, tempDateFrom, tempDateTo])

  const handleAmountApply = useCallback(() => {
    const min = tempAmountMin ? parseFloat(tempAmountMin) : null
    const max = tempAmountMax ? parseFloat(tempAmountMax) : null
    applyFilter({
      amountMin: min !== null && !isNaN(min) ? min : null,
      amountMax: max !== null && !isNaN(max) ? max : null,
    })
    setAmountOpen(false)
  }, [applyFilter, tempAmountMin, tempAmountMax])

  const active = hasActiveFilters(filters)

  return (
    <div className="space-y-2">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder={t("placeholder")}
          className="pl-9 pr-9"
        />
        {active && (
          <button
            type="button"
            onClick={handleClearAll}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{t("clearAll")}</span>
          </button>
        )}
      </div>

      {/* Filter buttons */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="h-7 gap-1.5 text-xs"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {t("filters")}
        </Button>

        {showFilters && (
          <>
            {/* Category filter */}
            <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 text-xs"
                >
                  <Tag className="h-3.5 w-3.5" />
                  {t("category")}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-56 p-2"
                align={isMobile ? "start" : "center"}
              >
                <div className="max-h-60 space-y-0.5 overflow-y-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
                    >
                      <CategoryChip
                        category={{
                          name: cat.name,
                          nameRo: cat.nameRo,
                          color: cat.color,
                          icon: cat.icon,
                        }}
                        size="sm"
                      />
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Date filter */}
            <Popover
              open={dateOpen}
              onOpenChange={(open) => {
                setDateOpen(open)
                if (open) {
                  setTempDateFrom(filters.dateFrom ?? "")
                  setTempDateTo(filters.dateTo ?? "")
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 text-xs"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  {t("dateRange")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="start">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      ["today", "thisWeek", "thisMonth", "last30Days"] as const
                    ).map((preset) => (
                      <Button
                        key={preset}
                        variant="outline"
                        size="sm"
                        onClick={() => handleDatePreset(preset)}
                        className="h-7 text-xs"
                      >
                        {t(preset)}
                      </Button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">
                        {t("from")}
                      </label>
                      <Input
                        type="date"
                        value={tempDateFrom}
                        onChange={(e) => setTempDateFrom(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">
                        {t("to")}
                      </label>
                      <Input
                        type="date"
                        value={tempDateTo}
                        onChange={(e) => setTempDateTo(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleDateApply}
                    className="h-7 w-full text-xs"
                  >
                    {t("apply")}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Amount filter */}
            <Popover
              open={amountOpen}
              onOpenChange={(open) => {
                setAmountOpen(open)
                if (open) {
                  setTempAmountMin(
                    filters.amountMin !== null ? String(filters.amountMin) : "",
                  )
                  setTempAmountMax(
                    filters.amountMax !== null ? String(filters.amountMax) : "",
                  )
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 text-xs"
                >
                  <DollarSign className="h-3.5 w-3.5" />
                  {t("amountRange")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" align="start">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">
                        {t("min")}
                      </label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={tempAmountMin}
                        onChange={(e) => setTempAmountMin(e.target.value)}
                        placeholder="0"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">
                        {t("max")}
                      </label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={tempAmountMax}
                        onChange={(e) => setTempAmountMax(e.target.value)}
                        placeholder="∞"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAmountApply}
                    className="h-7 w-full text-xs"
                  >
                    {t("apply")}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </>
        )}
      </div>

      {/* Active filter chips */}
      <FilterChips
        filters={filters}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAll}
      />
    </div>
  )
}
