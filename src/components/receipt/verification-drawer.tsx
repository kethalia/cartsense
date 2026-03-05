'use client'

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[95vh]">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Receipt Verification</DrawerTitle>
          <DrawerDescription>Verify and save your receipt data</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-auto px-4 pb-4">
          <VerificationClient
            receiptId={receiptId}
            imageData={imageData}
            mimeType={mimeType}
            onComplete={() => onOpenChange(false)}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
