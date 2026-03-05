'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { extractReceipt } from '@/actions/extract-receipt'
import { saveVerifiedReceipt } from '@/actions/save-verified-receipt'
import { ProcessingSkeleton } from '@/components/receipt/processing-skeleton'
import { ReceiptEditor } from '@/components/receipt/receipt-editor'
import type { ExtractionResult, VerifiedReceiptData } from '@/types/receipt'

type VerificationClientProps = {
  receiptId: string
  imageData: string
  mimeType: string
}

export function VerificationClient({
  receiptId,
  imageData,
  mimeType,
}: VerificationClientProps) {
  const router = useRouter()
  const t = useTranslations('Receipt')

  const [aiData, setAiData] = useState<ExtractionResult | null>(null)
  const [processing, setProcessing] = useState(true)
  const [saving, setSaving] = useState(false)

  const extractAction = useAction(extractReceipt)
  const saveAction = useAction(saveVerifiedReceipt)

  // Trigger AI extraction on mount
  useEffect(() => {
    const run = async () => {
      try {
        const result = await extractAction.executeAsync({ receiptId })

        if (result?.data?.status === 'success' && result.data.data) {
          setAiData(result.data.data)
        } else {
          console.error('[verification] extraction failed:', result?.data?.error ?? result?.serverError)
          toast.error(result?.data?.error ?? t('aiFailed'))
        }
      } catch (err) {
        console.error('[verification] extraction threw:', err)
        toast.error(t('aiError'))
      } finally {
        setProcessing(false)
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiptId])

  const handleSave = useCallback(
    async (data: VerifiedReceiptData) => {
      setSaving(true)
      try {
        const result = await saveAction.executeAsync({
          receiptId,
          ...data,
        })

        if (result?.data) {
          toast.success(t('receiptVerified'))
          router.push('/dashboard')
        } else {
          toast.error(t('saveFailed'))
          setSaving(false)
        }
      } catch {
        toast.error(t('saveFailed'))
        setSaving(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [receiptId, router, t]
  )

  if (processing) {
    return (
      <div className="p-4">
        <ProcessingSkeleton imageData={imageData} mimeType={mimeType} />
      </div>
    )
  }

  return (
    <div className="p-4">
      <ReceiptEditor
        aiData={aiData}
        imageData={imageData}
        mimeType={mimeType}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  )
}
