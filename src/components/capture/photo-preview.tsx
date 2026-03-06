"use client"

import { Loader2 } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { useState } from "react"
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
import { useIsMobile } from "@/hooks/use-mobile"

type PhotoPreviewProps = {
  previewUrl: string
  onConfirm: () => Promise<void>
  onRetake: () => void
  onClose: () => void
}

function PreviewImage({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt="Captured receipt preview"
      width={600}
      height={900}
      className="h-auto max-h-[70vh] w-full rounded-md object-contain"
      unoptimized
    />
  )
}

function PreviewActions({
  onConfirm,
  onRetake,
  onClose,
  saving,
  t,
}: {
  onConfirm: () => void
  onRetake: () => void
  onClose: () => void
  saving: boolean
  t: (key: string) => string
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={onClose}
          disabled={saving}
        >
          {t("cancel")}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={onRetake}
          disabled={saving}
        >
          {t("retake")}
        </Button>
      </div>
      <Button
        size="lg"
        className="w-full"
        onClick={onConfirm}
        disabled={saving}
      >
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("useThis")}
          </>
        ) : (
          t("useThis")
        )}
      </Button>
    </div>
  )
}

export function PhotoPreview(props: PhotoPreviewProps) {
  const { previewUrl, onConfirm, onRetake, onClose } = props
  const t = useTranslations("Camera")
  const isMobile = useIsMobile()
  const [saving, setSaving] = useState(false)

  const handleConfirm = async () => {
    setSaving(true)
    try {
      await onConfirm()
    } finally {
      setSaving(false)
    }
  }

  if (isMobile) {
    return (
      <Drawer open onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="px-4 pb-8">
          <DrawerTitle className="sr-only">{t("capture")}</DrawerTitle>
          <div className="pt-4">
            <PreviewImage src={previewUrl} />
          </div>
          <DrawerFooter className="px-0">
            <PreviewActions
              onConfirm={handleConfirm}
              onRetake={onRetake}
              onClose={onClose}
              saving={saving}
              t={t}
            />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl" showCloseButton={false}>
        <DialogTitle className="sr-only">{t("capture")}</DialogTitle>
        <PreviewImage src={previewUrl} />
        <DialogFooter>
          <PreviewActions
            onConfirm={handleConfirm}
            onRetake={onRetake}
            onClose={onClose}
            saving={saving}
            t={t}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
