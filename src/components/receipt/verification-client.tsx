'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { extractReceipt } from '@/actions/extract-receipt'
import { saveVerifiedReceipt } from '@/actions/save-verified-receipt'
import { ProcessingSkeleton } from '@/components/receipt/processing-skeleton'
import { ReceiptEditor, type ReceiptEditorMode } from '@/components/receipt/receipt-editor'
import type { ExtractionResult, ReceiptFormData, VerifiedReceiptData } from '@/types/receipt'

type ExistingData = {
  vendorName: string
  totalAmount: string
  receiptDate: string
  taxAmount: string
  paymentType: 'cash' | 'card' | 'other' | ''
  confidence?: number
  lineItems: { name: string; quantity: string; unitPrice: string }[]
}

type VerificationClientProps = {
  receiptId: string
  imageData: string
  mimeType: string
  /** 'verify' = fresh receipt, 'edit' = re-editing existing */
  mode?: ReceiptEditorMode
  /** Pre-loaded data from DB (skips AI extraction) */
  existingData?: ExistingData
}

let _idCounter = 0
function makeId() {
  _idCounter += 1
  return `ex-${Date.now()}-${_idCounter}`
}

export function VerificationClient({
  receiptId,
  imageData,
  mimeType,
  mode = 'verify',
  existingData,
}: VerificationClientProps) {
  const router = useRouter()
  const t = useTranslations('Receipt')

  const [aiData, setAiData] = useState<ExtractionResult | null>(null)
  const [initialFormData, setInitialFormData] = useState<ReceiptFormData | null>(null)
  const [processing, setProcessing] = useState(!existingData)
  const [saving, setSaving] = useState(false)

  const extractAction = useAction(extractReceipt)
  const saveAction = useAction(saveVerifiedReceipt)

  // If we have existing data, convert it to form data immediately
  useEffect(() => {
    if (existingData) {
      setInitialFormData({
        vendorName: existingData.vendorName,
        totalAmount: existingData.totalAmount,
        receiptDate: existingData.receiptDate,
        taxAmount: existingData.taxAmount,
        paymentType: existingData.paymentType,
        lineItems: existingData.lineItems.map((i) => ({
          id: makeId(),
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      })

      if (existingData.confidence != null) {
        setAiData({
          vendorName: existingData.vendorName || null,
          totalAmount: existingData.totalAmount ? Number(existingData.totalAmount) : null,
          receiptDate: existingData.receiptDate || null,
          taxAmount: existingData.taxAmount ? Number(existingData.taxAmount) : null,
          paymentType: existingData.paymentType || null,
          lineItems: [],
          confidence: existingData.confidence,
        })
      }
    }
  }, [existingData])

  // Trigger AI extraction on mount (only in verify mode without existing data)
  useEffect(() => {
    if (existingData) return

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
  }, [receiptId, existingData])

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
    return <ProcessingSkeleton imageData={imageData} mimeType={mimeType} />
  }

  return (
    <ReceiptEditor
      mode={mode}
      aiData={aiData}
      initialData={initialFormData}
      imageData={imageData}
      mimeType={mimeType}
      onSave={handleSave}
      saving={saving}
    />
  )
}
