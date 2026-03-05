'use client'

import * as React from 'react'
import { CardContent } from '@/components/ui/card'

type ImageCardProps = {
  imageData: string
  mimeType: string
}

export function ImageCard({ imageData, mimeType }: ImageCardProps) {
  const [scale, setScale] = React.useState(1)
  const src = `data:${mimeType};base64,${imageData}`

  return (
    <CardContent className="flex items-center justify-center p-4">
      <div
        className="overflow-auto max-h-[60vh] w-full touch-pinch-zoom"
        onDoubleClick={() => setScale((s) => (s > 1 ? 1 : 2))}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Receipt"
          className="w-full object-contain transition-transform duration-200"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
        />
      </div>
    </CardContent>
  )
}
