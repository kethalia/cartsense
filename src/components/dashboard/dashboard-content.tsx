"use client"

import { useCallback, useState } from "react"
import {
  ReceiptList,
  type ReceiptWithCategory,
} from "@/components/dashboard/receipt-list"
import { ReceiptSearch } from "@/components/dashboard/receipt-search"

interface Props {
  receipts: ReceiptWithCategory[]
}

export function DashboardContent({ receipts: initialReceipts }: Props) {
  const [searchResults, setSearchResults] = useState<
    ReceiptWithCategory[] | null
  >(null)
  const [matchContext, setMatchContext] = useState<
    Record<string, { field: string; matchedText: string }[]>
  >({})
  const [isSearching, setIsSearching] = useState(false)

  const handleResults = useCallback(
    (
      results: ReceiptWithCategory[] | null,
      context: Record<string, { field: string; matchedText: string }[]>,
      searching: boolean,
    ) => {
      setSearchResults(results)
      setMatchContext(context)
      setIsSearching(searching)
    },
    [],
  )

  const displayReceipts = searchResults ?? initialReceipts
  const isFiltered = searchResults !== null

  return (
    <div className="space-y-4">
      <ReceiptSearch onResults={handleResults} />

      {isSearching ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          ...
        </div>
      ) : (
        <ReceiptList
          receipts={displayReceipts}
          matchContext={isFiltered ? matchContext : undefined}
          isFiltered={isFiltered}
        />
      )}
    </div>
  )
}
