"use client"

import { Download, Eye, FileText, MoreVertical, Trash2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useFormatter, useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item"
import { useIsMobile } from "@/hooks/use-mobile"
import { Link } from "@/i18n/navigation"
import { deleteReceipt } from "@/lib/actions/delete-receipt"
import { downloadImage, formatFileSize } from "@/lib/utils"
import type { ReceiptSummary } from "@/schemas"

export function ReceiptCard({ receipt }: { receipt: ReceiptSummary }) {
  const { id, imageData, mimeType, fileSize, capturedAt } = receipt
  const t = useTranslations("Dashboard")
  const format = useFormatter()
  const router = useRouter()
  const isMobile = useIsMobile()
  const [viewOpen, setViewOpen] = useState(false)

  const { executeAsync, isExecuting } = useAction(deleteReceipt, {
    onSuccess: () => {
      toast.success(t("receiptDeleted"))
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? t("deleteError"))
    },
  })

  const formattedDate = format.dateTime(new Date(capturedAt), {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const dataUri = `data:${mimeType};base64,${imageData}`

  return (
    <>
      <Item variant="outline">
        <ItemHeader>
          <Image
            src={dataUri}
            alt="Receipt"
            width={256}
            height={256}
            className="aspect-[3/4] w-full rounded-sm object-cover"
            unoptimized
          />
        </ItemHeader>
        <ItemContent>
          <ItemTitle>{t("capturedAt", { date: formattedDate })}</ItemTitle>
          {fileSize && (
            <ItemDescription>{formatFileSize(fileSize)}</ItemDescription>
          )}
        </ItemContent>
        <ItemActions>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">{t("actions")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/receipt/${id}`}>
                  <FileText className="h-4 w-4" />
                  {t("details")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewOpen(true)}>
                <Eye className="h-4 w-4" />
                {t("view")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => downloadImage(imageData, mimeType)}
              >
                <Download className="h-4 w-4" />
                {t("download")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => executeAsync({ id })}
                disabled={isExecuting}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                {t("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ItemActions>
      </Item>

      {isMobile ? (
        <Drawer open={viewOpen} onOpenChange={setViewOpen}>
          <DrawerContent className="px-4 pb-8">
            <DrawerTitle className="sr-only">{t("view")}</DrawerTitle>
            <div className="pt-4">
              <Image
                src={dataUri}
                alt={t("view")}
                width={800}
                height={1200}
                className="h-auto max-h-[85vh] w-full rounded-md object-contain"
                unoptimized
              />
            </div>
            <DrawerFooter className="px-0">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => setViewOpen(false)}
              >
                {t("close")}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-3xl" showCloseButton={false}>
            <DialogTitle className="sr-only">{t("view")}</DialogTitle>
            <Image
              src={dataUri}
              alt={t("view")}
              width={800}
              height={1200}
              className="h-auto max-h-[85vh] w-full rounded-md object-contain"
              unoptimized
            />
            <DialogFooter>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => setViewOpen(false)}
              >
                {t("close")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
