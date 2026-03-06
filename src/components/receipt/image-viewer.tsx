'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { ZoomIn, ZoomOut, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'

type ImageViewerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  src: string
  alt?: string
}

const MIN_SCALE = 0.5
const MAX_SCALE = 5
const ZOOM_STEP = 0.5

export function ImageViewer({ open, onOpenChange, src, alt = 'Image' }: ImageViewerProps) {
  const t = useTranslations('Receipt')
  const containerRef = React.useRef<HTMLDivElement>(null)

  const [scale, setScale] = React.useState(1)
  const [translate, setTranslate] = React.useState({ x: 0, y: 0 })
  const [dragging, setDragging] = React.useState(false)
  const dragStart = React.useRef({ x: 0, y: 0, tx: 0, ty: 0 })

  // Reset on open
  React.useEffect(() => {
    if (open) {
      setScale(1)
      setTranslate({ x: 0, y: 0 })
    }
  }, [open])

  const zoomIn = React.useCallback(() => {
    setScale((s) => Math.min(s + ZOOM_STEP, MAX_SCALE))
  }, [])

  const zoomOut = React.useCallback(() => {
    setScale((s) => Math.max(s - ZOOM_STEP, MIN_SCALE))
  }, [])

  const resetView = React.useCallback(() => {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
  }, [])

  // Wheel zoom
  const handleWheel = React.useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.2 : 0.2
    setScale((s) => Math.min(Math.max(s + delta, MIN_SCALE), MAX_SCALE))
  }, [])

  // Mouse drag
  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      if (scale <= 1) return
      setDragging(true)
      dragStart.current = { x: e.clientX, y: e.clientY, tx: translate.x, ty: translate.y }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [scale, translate]
  )

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      setTranslate({ x: dragStart.current.tx + dx, y: dragStart.current.ty + dy })
    },
    [dragging]
  )

  const handlePointerUp = React.useCallback(() => {
    setDragging(false)
  }, [])

  // Double-click to toggle zoom
  const handleDoubleClick = React.useCallback(() => {
    if (scale > 1) {
      resetView()
    } else {
      setScale(2.5)
    }
  }, [scale, resetView])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="h-[100dvh] max-h-[100dvh] w-screen max-w-none rounded-none border-none p-0 sm:rounded-none flex flex-col bg-black/95"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{t('receiptImage')}</DialogTitle>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-black/80 backdrop-blur-sm z-10 shrink-0">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
              onClick={zoomOut}
              disabled={scale <= MIN_SCALE}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-white/60 w-12 text-center tabular-nums">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
              onClick={zoomIn}
              disabled={scale >= MAX_SCALE}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
              onClick={resetView}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Image canvas */}
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden select-none"
          style={{ cursor: scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in' }}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={handleDoubleClick}
        >
          <div className="w-full h-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              draggable={false}
              className="max-w-full max-h-full object-contain transition-transform duration-100"
              style={{
                transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                transformOrigin: 'center center',
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
