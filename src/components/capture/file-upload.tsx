"use client"

import {
  useRef,
  useImperativeHandle,
  forwardRef,
  type ChangeEvent,
} from "react"
import { checkImageDimensions } from "@/lib/utils"
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_SIZE,
  MIN_IMAGE_DIMENSION,
} from "@/lib/config"

export type FileUploadHandle = {
  trigger: () => void
}

type FileUploadProps = {
  onUpload: (file: File, previewUrl: string) => void
  onError: (message: string) => void
}

export const FileUpload = forwardRef<FileUploadHandle, FileUploadProps>(
  function FileUpload({ onUpload, onError }, ref) {
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

    const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
        onError("invalidFileType")
        return
      }

      // Validate file size
      if (file.size > MAX_UPLOAD_SIZE) {
        onError("fileTooLarge")
        return
      }

      // Validate image dimensions
      try {
        const { width, height } = await checkImageDimensions(file)
        if (width < MIN_IMAGE_DIMENSION || height < MIN_IMAGE_DIMENSION) {
          onError("imageTooSmall")
          return
        }
      } catch {
        onError("invalidFileType")
        return
      }

      // All validations passed
      const previewUrl = URL.createObjectURL(file)
      onUpload(file, previewUrl)
    }

    return (
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleChange}
        className="hidden"
        aria-hidden="true"
      />
    )
  },
)
