'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { StackedCardsWithTabs, type CardConfig } from './stacked-cards'
import { ImageCard } from './image-card'
import { AIDataCard } from './ai-data-card'
import { ManualEntryCard } from './manual-entry-card'
import { MergePreviewCard } from './merge-preview-card'
import { useFieldSources } from '@/hooks/use-field-sources'
import type {
  ExtractionResult,
  ManualEntryData,
  VerifiedReceiptData,
} from '@/types/receipt'

type ReceiptVerificationProps = {
  imageData: string
  mimeType: string
  aiData: ExtractionResult | null
  aiLoading: boolean
  onSave: (data: VerifiedReceiptData) => void
  saving?: boolean
}

function getDefaultDate(): string {
  return new Date().toISOString().split('T')[0]
}

function createEmptyManualData(): ManualEntryData {
  return {
    vendorName: '',
    totalAmount: '',
    receiptDate: getDefaultDate(),
    taxAmount: '',
    paymentType: '' as ManualEntryData['paymentType'],
    lineItems: [],
  }
}

function aiToManualData(ai: ExtractionResult): ManualEntryData {
  return {
    vendorName: ai.vendorName ?? '',
    totalAmount: ai.totalAmount !== null ? String(ai.totalAmount) : '',
    receiptDate: ai.receiptDate ?? getDefaultDate(),
    taxAmount: ai.taxAmount !== null ? String(ai.taxAmount) : '',
    paymentType: ai.paymentType ?? '',
    lineItems: ai.lineItems.map((item, i) => ({
      id: `ai-${i}`,
      name: item.name,
      quantity: String(item.quantity),
      price: String(item.unitPrice),
    })),
  }
}

export function ReceiptVerification({
  imageData,
  mimeType,
  aiData,
  aiLoading,
  onSave,
  saving,
}: ReceiptVerificationProps) {
  const [manualData, setManualData] = React.useState<ManualEntryData>(
    createEmptyManualData,
  )
  const [activeCard, setActiveCard] = React.useState<string>('image')
  const prevAiDataRef = React.useRef<ExtractionResult | null>(null)

  // When aiData arrives for the first time, pre-fill manual with AI values
  // and switch to AI card
  React.useEffect(() => {
    if (aiData && !prevAiDataRef.current) {
      setManualData(aiToManualData(aiData))
      setActiveCard('ai')
    }
    prevAiDataRef.current = aiData
  }, [aiData])

  const defaultSource = aiData ? 'ai' : 'manual'

  const {
    fieldSources,
    setFieldSource,
    setAllSources,
    mergedData,
    isValid,
    errors,
  } = useFieldSources({ aiData, manualData, defaultSource })

  // Reset all sources to AI when aiData first appears
  const aiDataArrived = React.useRef(false)
  React.useEffect(() => {
    if (aiData && !aiDataArrived.current) {
      setAllSources('ai')
      aiDataArrived.current = true
    }
  }, [aiData, setAllSources])

  // When AI fails (no data after loading), show manual card
  React.useEffect(() => {
    if (!aiLoading && !aiData) {
      setActiveCard('manual')
    }
  }, [aiLoading, aiData])

  const handleSave = React.useCallback(() => {
    if (mergedData && isValid) {
      onSave(mergedData)
    }
  }, [mergedData, isValid, onSave])

  const cards: CardConfig[] = React.useMemo(
    () => [
      {
        id: 'image',
        label: 'Receipt',
        content: <ImageCard imageData={imageData} mimeType={mimeType} />,
      },
      {
        id: 'manual',
        label: 'Manual',
        content: (
          <ManualEntryCard
            data={manualData}
            onChange={setManualData}
            fieldSources={fieldSources}
            onToggleSource={(field, source) => setFieldSource(field, source)}
            errors={errors}
          />
        ),
      },
      {
        id: 'ai',
        label: 'AI',
        content: (
          <AIDataCard
            data={aiData}
            fieldSources={fieldSources}
            onToggleSource={(field, source) => setFieldSource(field, source)}
            loading={aiLoading}
          />
        ),
      },
      {
        id: 'merge',
        label: 'Preview',
        content: (
          <MergePreviewCard
            mergedData={mergedData}
            fieldSources={fieldSources}
            isValid={isValid}
          />
        ),
      },
    ],
    [imageData, mimeType, manualData, fieldSources, errors, aiData, aiLoading, mergedData, isValid, setFieldSource],
  )

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <StackedCardsWithTabs
        cards={cards}
        activeCardId={activeCard}
        onCardChange={setActiveCard}
      />

      <Button
        size="lg"
        className="w-full max-w-sm"
        disabled={!isValid || saving}
        onClick={handleSave}
      >
        {saving ? 'Saving...' : 'Save Receipt'}
      </Button>
    </div>
  )
}
