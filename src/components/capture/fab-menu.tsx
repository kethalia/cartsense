'use client'

import { useState, useCallback } from 'react'
import { Plus, Camera, Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

type FabMenuProps = {
  onTakePhoto: () => void
  onUploadImage: () => void
}

export function FabMenu({ onTakePhoto, onUploadImage }: FabMenuProps) {
  const t = useTranslations('Camera')
  const [isOpen, setIsOpen] = useState(false)

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleTakePhoto = useCallback(() => {
    close()
    onTakePhoto()
  }, [close, onTakePhoto])

  const handleUploadImage = useCallback(() => {
    close()
    onUploadImage()
  }, [close, onUploadImage])

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 transition-opacity duration-200"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Menu container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-center gap-3">
        {/* Main FAB button */}
        <Button
          size="icon"
          onClick={toggle}
          className="h-14 w-14 rounded-full shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95"
          aria-label={isOpen ? t('cancel') : t('capture')}
          aria-expanded={isOpen}
        >
          <Plus
            className={`h-6 w-6 transition-transform duration-200 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
          />
        </Button>

        {/* Upload Image option (appears second from bottom, so above camera) */}
        <div
          className={`flex items-center gap-2 transition-all duration-200 ${
            isOpen
              ? 'translate-y-0 scale-100 opacity-100'
              : 'pointer-events-none translate-y-4 scale-75 opacity-0'
          }`}
        >
          <span className="rounded-md bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-sm">
            {t('uploadImage')}
          </span>
          <Button
            size="icon"
            variant="secondary"
            onClick={handleUploadImage}
            className="h-12 w-12 rounded-full shadow-md"
            aria-label={t('uploadImage')}
            tabIndex={isOpen ? 0 : -1}
          >
            <Upload className="h-5 w-5" />
          </Button>
        </div>

        {/* Take Photo option (appears first from bottom, directly above FAB) */}
        <div
          className={`flex items-center gap-2 transition-all duration-200 ${
            isOpen
              ? 'translate-y-0 scale-100 opacity-100'
              : 'pointer-events-none translate-y-8 scale-75 opacity-0'
          }`}
        >
          <span className="rounded-md bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-sm">
            {t('takePhoto')}
          </span>
          <Button
            size="icon"
            variant="secondary"
            onClick={handleTakePhoto}
            className="h-12 w-12 rounded-full shadow-md"
            aria-label={t('takePhoto')}
            tabIndex={isOpen ? 0 : -1}
          >
            <Camera className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  )
}
