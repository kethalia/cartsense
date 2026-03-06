"use client"

import { ImagePlus } from "lucide-react"
import { useTranslations } from "next-intl"
import { type ChangeEvent, useCallback, useRef } from "react"
import { toast } from "sonner"
import { BatchQueueItem } from "@/components/capture/batch-queue-item"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_SIZE } from "@/lib/config"
import type { BatchItem } from "@/schemas"

interface Props {
  items: BatchItem[]
  onAdd: (files: File[]) => void
  onRemove: (index: number) => void
  maxItems: number
  disabled?: boolean
}

export function BatchQueue({
  items,
  onAdd,
  onRemove,
  maxItems,
  disabled = false,
}: Props) {
  const t = useTranslations("Batch")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAddClick = useCallback(() => {
    if (items.length >= maxItems) {
      toast.error(t("limitReached", { max: maxItems }))
      return
    }
    if (inputRef.current) {
      inputRef.current.value = ""
    }
    inputRef.current?.click()
  }, [items.length, maxItems, t])

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files
      if (!fileList) return

      const remaining = maxItems - items.length
      const selected = Array.from(fileList)

      // Validate each file
      const valid = selected.filter((f) => {
        if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(f.type)) {
          return false
        }
        if (f.size > MAX_UPLOAD_SIZE) {
          return false
        }
        return true
      })

      if (valid.length === 0) return

      // Enforce limit
      const toAdd = valid.slice(0, remaining)
      if (valid.length > remaining) {
        toast.error(t("limitReached", { max: maxItems }))
      }

      onAdd(toAdd)
    },
    [items.length, maxItems, onAdd, t],
  )

  const progress = (items.length / maxItems) * 100

  return (
    <div className="flex flex-col gap-3">
      {/* Counter + progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {t("queueCount", { count: items.length, max: maxItems })}
        </span>
      </div>
      <Progress value={progress} className="h-1.5" />

      {/* Queue items */}
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <BatchQueueItem
            key={`${item.file.name}-${index}`}
            fileName={item.file.name}
            previewUrl={item.previewUrl}
            status={item.status}
            result={item.result}
            error={item.error}
            onRemove={
              item.status === "queued" && !disabled
                ? () => onRemove(index)
                : undefined
            }
          />
        ))}
      </div>

      {/* Add more button */}
      {!disabled && items.length < maxItems && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddClick}
          className="w-full"
        >
          <ImagePlus className="mr-2 h-4 w-4" />
          {t("addMore")}
        </Button>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  )
}
