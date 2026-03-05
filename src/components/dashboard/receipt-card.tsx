'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations, useFormatter } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { Trash2, Eye, Download } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
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

function formatFileSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function downloadImage(imageData: string, mimeType: string) {
  const ext = mimeType.split('/')[1] || 'jpg'
  const link = document.createElement('a')
  link.href = `data:${mimeType};base64,${imageData}`
  link.download = `receipt.${ext}`
  link.click()
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
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setViewOpen(true)}
            aria-label={t('view')}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => downloadImage(imageData, mimeType)}
            aria-label={t('download')}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => executeAsync({ id })}
            disabled={isExecuting}
            aria-label={t('delete')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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
