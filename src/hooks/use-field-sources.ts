'use client'

import { useState, useMemo, useCallback } from 'react'
import type {
  FieldSources,
  FieldSource,
  ReceiptFieldName,
  ManualEntryData,
  ExtractionResult,
  VerifiedReceiptData,
  PaymentType,
} from '@/types/receipt'
import { RECEIPT_FIELDS } from '@/types/receipt'

type UseFieldSourcesProps = {
  aiData: ExtractionResult | null
  manualData: ManualEntryData
  defaultSource?: FieldSource
}

type UseFieldSourcesReturn = {
  fieldSources: FieldSources
  setFieldSource: (field: ReceiptFieldName, source: FieldSource) => void
  setAllSources: (source: FieldSource) => void
  mergedData: VerifiedReceiptData | null
  isValid: boolean
  errors: Record<string, string>
}

function createDefaultSources(source: FieldSource): FieldSources {
  return RECEIPT_FIELDS.reduce(
    (acc, field) => ({ ...acc, [field]: source }),
    {} as FieldSources,
  )
}

function parseAmount(value: string): number {
  const parsed = parseFloat(value)
  return isNaN(parsed) ? 0 : parsed
}

export function useFieldSources({
  aiData,
  manualData,
  defaultSource,
}: UseFieldSourcesProps): UseFieldSourcesReturn {
  const resolvedDefault = defaultSource ?? (aiData ? 'ai' : 'manual')
  const [fieldSources, setFieldSources] = useState<FieldSources>(
    () => createDefaultSources(resolvedDefault),
  )

  const setFieldSource = useCallback(
    (field: ReceiptFieldName, source: FieldSource) => {
      setFieldSources((prev) => ({ ...prev, [field]: source }))
    },
    [],
  )

  const setAllSources = useCallback((source: FieldSource) => {
    setFieldSources(createDefaultSources(source))
  }, [])

  const mergedData = useMemo<VerifiedReceiptData | null>(() => {
    // Build merged data by picking from AI or manual per-field
    const getValue = <T,>(
      field: ReceiptFieldName,
      fromAi: T | null | undefined,
      fromManual: T,
    ): T | null => {
      if (fieldSources[field] === 'ai' && aiData) {
        return fromAi ?? null
      }
      return fromManual
    }

    const vendorName =
      fieldSources.vendorName === 'ai' && aiData
        ? aiData.vendorName ?? ''
        : manualData.vendorName

    const totalAmount =
      fieldSources.totalAmount === 'ai' && aiData
        ? aiData.totalAmount ?? 0
        : parseAmount(manualData.totalAmount)

    const receiptDate = getValue(
      'receiptDate',
      aiData?.receiptDate,
      manualData.receiptDate || null,
    )

    const taxAmount =
      fieldSources.taxAmount === 'ai' && aiData
        ? aiData.taxAmount
        : manualData.taxAmount
          ? parseAmount(manualData.taxAmount)
          : null

    const paymentType = getValue<PaymentType | null>(
      'paymentType',
      aiData?.paymentType ?? null,
      (manualData.paymentType as PaymentType) || null,
    )

    return {
      vendorName,
      totalAmount,
      receiptDate: receiptDate ?? null,
      taxAmount,
      paymentType,
    }
  }, [fieldSources, aiData, manualData])

  const errors = useMemo<Record<string, string>>(() => {
    const errs: Record<string, string> = {}
    if (!mergedData || !mergedData.vendorName.trim()) {
      errs.vendorName = 'Vendor name is required'
    }
    if (!mergedData || mergedData.totalAmount <= 0) {
      errs.totalAmount = 'Total amount is required'
    }
    return errs
  }, [mergedData])

  const isValid = Object.keys(errors).length === 0

  return {
    fieldSources,
    setFieldSource,
    setAllSources,
    mergedData,
    isValid,
    errors,
  }
}
