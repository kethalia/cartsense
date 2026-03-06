'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useTranslations, useFormatter } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { Trash2, Eye, Download, MoreVertical, FileText } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { formatFileSize, downloadImage } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  Item,
  ItemHeader,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from '@/components/ui/item'
import { deleteReceipt } from '@/actions/delete-receipt'

type ReceiptCardProps = {
  id: string
  imageData: string
  mimeType: string
  fileSize: number | null
  capturedAt: Date
}

function ReceiptImageView({ dataUri, label }: { dataUri: string; label: string }) {
  return (
    <Image
      src={dataUri}
      alt={label}
      width={800}
      height={1200}
      className="h-auto max-h-[85vh] w-full rounded-md object-contain"
      unoptimized
    />
  )
}

export function ReceiptCard({ id, imageData, mimeType, fileSize, capturedAt }: ReceiptCardProps) {
  const t = useTranslations('Dashboard')
  const format = useFormatter()
  const router = useRouter()
  const isMobile = useIsMobile()
  const [viewOpen, setViewOpen] = useState(false)

  const { executeAsync, isExecuting } = useAction(deleteReceipt, {
    onSuccess: () => {
      toast.success(t('receiptDeleted'))
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? t('deleteError'))
    },
  })

  const formattedDate = format.dateTime(new Date(capturedAt), {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
          <ItemTitle>{t('capturedAt', { date: formattedDate })}</ItemTitle>
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
                <span className="sr-only">{t('actions')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/receipt/${id}`}>
                  <FileText className="h-4 w-4" />
                  {t('details')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewOpen(true)}>
                <Eye className="h-4 w-4" />
                {t('view')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadImage(imageData, mimeType)}>
                <Download className="h-4 w-4" />
                {t('download')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => executeAsync({ id })}
                disabled={isExecuting}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                {t('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ItemActions>
      </Item>

      {isMobile ? (
        <Drawer open={viewOpen} onOpenChange={setViewOpen}>
          <DrawerContent className="px-4 pb-8">
            <DrawerTitle className="sr-only">{t('view')}</DrawerTitle>
            <div className="pt-4">
              <ReceiptImageView dataUri={dataUri} label={t('view')} />
            </div>
            <DrawerFooter className="px-0">
              <Button variant="outline" size="lg" className="w-full" onClick={() => setViewOpen(false)}>
                {t('close')}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-3xl" showCloseButton={false}>
            <DialogTitle className="sr-only">{t('view')}</DialogTitle>
            <ReceiptImageView dataUri={dataUri} label={t('view')} />
            <DialogFooter>
              <Button variant="outline" size="lg" className="w-full" onClick={() => setViewOpen(false)}>
                {t('close')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
