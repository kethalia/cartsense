'use client'

import { useRef, useImperativeHandle, forwardRef, type ChangeEvent } from 'react'

export type FileUploadHandle = {
  trigger: () => void
}

type FileUploadProps = {
  onUpload: (file: File, previewUrl: string) => void
  onError: (message: string) => void
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MIN_DIMENSION = 300

function checkImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

export const FileUpload = forwardRef<FileUploadHandle, FileUploadProps>(
  function FileUpload({ onUpload, onError }, ref) {
    const inputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      trigger: () => {
        // Reset value so the same file can be re-selected
        if (inputRef.current) {
          inputRef.current.value = ''
        }
        inputRef.current?.click()
      },
    }))

    const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!ACCEPTED_TYPES.includes(file.type)) {
        onError('invalidFileType')
        return
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        onError('fileTooLarge')
        return
      }

      // Validate image dimensions
      try {
        const { width, height } = await checkImageDimensions(file)
        if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
          onError('imageTooSmall')
          return
        }
      } catch {
        onError('invalidFileType')
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
  }
)
