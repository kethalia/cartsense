"use client"

import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import { ProcessingSkeleton } from "@/components/receipt/processing-skeleton"
import { ReceiptEditor } from "@/components/receipt/receipt-editor"
import { Button } from "@/components/ui/button"
import { extractReceipt } from "@/lib/actions/extract-receipt"
import { saveVerifiedReceipt } from "@/lib/actions/save-verified-receipt"
import type {
  ExtractionResult,
  ReceiptData,
  ReceiptFormData,
  ReceiptImage,
} from "@/schemas"

/** Transform AI extraction result → form data at the boundary */
function extractionToFormData(ai: ExtractionResult): ReceiptFormData {
  return {
    vendorName: ai.vendorName ?? "",
    totalAmount: ai.totalAmount !== null ? String(ai.totalAmount) : "",
    receiptDate: ai.receiptDate ?? new Date().toISOString().split("T")[0],
    taxAmount: ai.taxAmount !== null ? String(ai.taxAmount) : "",
    paymentType: ai.paymentType ?? "",
    lineItems: ai.lineItems.map((item) => ({
      id: uuidv4(),
      name: item.name,
      quantity: String(item.quantity),
      unitPrice: String(item.unitPrice),
    })),
  }
}

/** Empty form data for manual entry */
const emptyFormData: ReceiptFormData = {
  vendorName: "",
  totalAmount: "",
  receiptDate: new Date().toISOString().split("T")[0],
  taxAmount: "",
  paymentType: "",
  lineItems: [],
}

type VerificationClientProps = {
  receiptId: string
  image: ReceiptImage
  /** Pre-filled form data from DB (skips AI extraction) */
  existingData?: ReceiptFormData
}

export function VerificationClient(props: VerificationClientProps) {
  const { receiptId, image, existingData } = props
  const router = useRouter()
  const t = useTranslations("Receipt")

  const [formData, setFormData] = useState<ReceiptFormData | null>(
    existingData ?? null,
  )
  const [processing, setProcessing] = useState(!existingData)
  const [extractionError, setExtractionError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const extractAction = useAction(extractReceipt)
  const saveAction = useAction(saveVerifiedReceipt)

  const runExtraction = useCallback(async () => {
    setProcessing(true)
    setExtractionError(null)

    try {
      const result = await extractAction.executeAsync({ receiptId })

      if (result?.data?.status === "success" && result.data.data) {
        setFormData(extractionToFormData(result.data.data))
      } else {
        const error = result?.data?.error ?? t("aiFailed")
        console.error("[verification] extraction failed:", error)
        setExtractionError(error)
      }
    } catch (err) {
      console.error("[verification] extraction threw:", err)
      setExtractionError(t("aiError"))
    } finally {
      setProcessing(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiptId, t])

  // Trigger AI extraction on mount (only without existing data)
  useEffect(() => {
    if (existingData) return
    runExtraction()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingData])

  const handleSave = useCallback(
    async (data: ReceiptData) => {
      setSaving(true)
      try {
        const result = await saveAction.executeAsync({
          receiptId,
          ...data,
        })

        if (result?.data) {
          toast.success(t("receiptVerified"))
          router.push("/dashboard")
        } else {
          toast.error(t("saveFailed"))
          setSaving(false)
        }
      } catch {
        toast.error(t("saveFailed"))
        setSaving(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [receiptId, router, t],
  )

  if (processing) {
    return <ProcessingSkeleton image={image} />
  }

  // Extraction failed — show error with Retry and manual entry options
  if (extractionError && !formData) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-sm text-destructive">{extractionError}</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={runExtraction}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t("retry")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFormData(emptyFormData)}
          >
            {t("enterManually")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ReceiptEditor
      image={image}
      initialData={formData ?? emptyFormData}
      onSave={handleSave}
      saving={saving}
    />
  )
}
