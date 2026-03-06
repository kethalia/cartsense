import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Check image dimensions by loading it in a temporary Image element. */
export function checkImageDimensions(file: File): Promise<{ width: number; height: number }> {
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

/** Format bytes into a human-readable string (e.g. 1.2 MB). */
export function formatFileSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Trigger a browser download for a base64-encoded image. */
export function downloadImage(imageData: string, mimeType: string) {
  const ext = mimeType.split('/')[1] || 'jpg'
  const link = document.createElement('a')
  link.href = `data:${mimeType};base64,${imageData}`
  link.download = `receipt.${ext}`
  link.click()
}
