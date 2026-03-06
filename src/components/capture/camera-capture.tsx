"use client"

import {
  useRef,
  useImperativeHandle,
  forwardRef,
  type ChangeEvent,
} from "react"

export type CameraCaptureHandle = {
  trigger: () => void
}

type CameraCaptureProps = {
  onCapture: (file: File, previewUrl: string) => void
}

export const CameraCapture = forwardRef<
  CameraCaptureHandle,
  CameraCaptureProps
>(function CameraCapture({ onCapture }, ref) {
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    trigger: () => {
      // Reset value so the same file can be re-selected
      if (inputRef.current) {
        inputRef.current.value = ""
      }
      inputRef.current?.click()
    },
  }))

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      onCapture(file, previewUrl)
    }
  }

  return (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      capture="environment"
      onChange={handleChange}
      className="hidden"
      aria-hidden="true"
    />
  )
})
