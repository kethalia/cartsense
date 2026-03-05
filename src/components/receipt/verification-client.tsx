'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { extractReceipt } from '@/actions/extract-receipt'
import { saveVerifiedReceipt } from '@/actions/save-verified-receipt'
import { ReceiptVerification } from '@/components/receipt/receipt-verification'
import { ProcessingSkeleton } from '@/components/receipt/processing-skeleton'
import { AIReadyBanner } from '@/components/receipt/ai-ready-banner'
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
  const [aiLoading, setAiLoading] = useState(true)
  const [aiTimedOut, setAiTimedOut] = useState(false)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [showAiReadyBanner, setShowAiReadyBanner] = useState(false)
  const [saving, setSaving] = useState(false)

  // Track whether manual entry was active when AI completed
  const showManualEntryRef = useRef(false)
  showManualEntryRef.current = showManualEntry

  const extractAction = useAction(extractReceipt)
  const saveAction = useAction(saveVerifiedReceipt)

  // Trigger AI extraction on mount
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    const runExtraction = async () => {
      // Start 10-second timeout
      timeoutId = setTimeout(() => {
        setAiTimedOut(true)
      }, 10000)

      try {
        const result = await extractAction.executeAsync({ receiptId })

        // Clear timeout
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        if (result?.data?.status === 'success' && result.data.data) {
          setAiData(result.data.data)
          setAiLoading(false)

          // If user already skipped to manual entry, show banner
          if (showManualEntryRef.current) {
            setShowAiReadyBanner(true)
          }
        } else {
          // Extraction failed
          setAiLoading(false)
          setShowManualEntry(true)
          toast.error(t('aiFailed'))
        }
      } catch {
        // API error
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        setAiLoading(false)
        setShowManualEntry(true)
        toast.error(t('aiError'))
      }
    }

    runExtraction()

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiptId])

  const handleSkipToManual = useCallback(() => {
    setShowManualEntry(true)
  }, [])

  const handleMerge = useCallback(() => {
    setShowAiReadyBanner(false)
    // AI data is already in state — ReceiptVerification will pick it up
  }, [])

  const handleDismissBanner = useCallback(() => {
    setShowAiReadyBanner(false)
  }, [])

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

  // Phase 1: Processing screen (AI loading, user hasn't skipped)
  if (aiLoading && !showManualEntry) {
    return (
      <ProcessingSkeleton
        imageData={imageData}
        mimeType={mimeType}
        timedOut={aiTimedOut}
        onSkip={handleSkipToManual}
      />
    )
  }

  // Phase 2: Verification screen (stacked cards)
  return (
    <>
      {showAiReadyBanner && (
        <AIReadyBanner onMerge={handleMerge} onDismiss={handleDismissBanner} />
      )}
      <ReceiptVerification
        imageData={imageData}
        mimeType={mimeType}
        aiData={aiData}
        aiLoading={aiLoading}
        onSave={handleSave}
        saving={saving}
      />
    </>
  )
}
