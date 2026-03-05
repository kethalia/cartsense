'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { VerificationClient } from './verification-client'

type VerificationDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  receiptId: string | null
  imageData: string | null
  mimeType: string | null
}

export function VerificationDrawer({
  open,
  onOpenChange,
  receiptId,
  imageData,
  mimeType,
}: VerificationDrawerProps) {
  if (!receiptId || !imageData || !mimeType) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="h-[100dvh] max-h-[100dvh] w-screen max-w-none rounded-none border-none p-0 sm:rounded-none overflow-auto"
        showCloseButton
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Receipt Verification</DialogTitle>
          <DialogDescription>Verify and save your receipt data</DialogDescription>
        </DialogHeader>
        <div className="px-4 pb-6 pt-2">
          <VerificationClient
            receiptId={receiptId}
            imageData={imageData}
            mimeType={mimeType}
            onComplete={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
