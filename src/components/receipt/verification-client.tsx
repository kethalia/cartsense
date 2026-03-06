"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractReceipt } from "@/lib/actions/extract-receipt";
import { saveVerifiedReceipt } from "@/lib/actions/save-verified-receipt";
import { ProcessingSkeleton } from "@/components/receipt/processing-skeleton";
import { ReceiptEditor } from "@/components/receipt/receipt-editor";
import type { ExtractionResult, ReceiptFormData, ReceiptData } from "@/schemas";

type VerificationClientProps = {
  receiptId: string;
  imageData: string;
  mimeType: string;
  /** 'verify' = fresh receipt, 'edit' = re-editing existing */
  mode?: "verify" | "edit";
  /** Pre-filled form data from DB (skips AI extraction) */
  existingData?: ReceiptFormData;
};

export function VerificationClient({
  receiptId,
  imageData,
  mimeType,
  mode = "verify",
  existingData,
}: VerificationClientProps) {
  const router = useRouter();
  const t = useTranslations("Receipt");

  const [aiData, setAiData] = useState<ExtractionResult | null>(null);
  const [initialFormData, setInitialFormData] =
    useState<ReceiptFormData | null>(null);
  const [processing, setProcessing] = useState(!existingData);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const extractAction = useAction(extractReceipt);
  const saveAction = useAction(saveVerifiedReceipt);

  // If we have existing data, use it directly as form data
  useEffect(() => {
    if (existingData) {
      setInitialFormData(existingData);
    }
  }, [existingData]);

  const runExtraction = useCallback(async () => {
    setProcessing(true);
    setExtractionError(null);

    try {
      const result = await extractAction.executeAsync({ receiptId });

      if (result?.data?.status === "success" && result.data.data) {
        setAiData(result.data.data);
      } else {
        const error = result?.data?.error ?? t("aiFailed");
        console.error("[verification] extraction failed:", error);
        setExtractionError(error);
      }
    } catch (err) {
      console.error("[verification] extraction threw:", err);
      setExtractionError(t("aiError"));
    } finally {
      setProcessing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiptId, t]);

  // Trigger AI extraction on mount (only in verify mode without existing data)
  useEffect(() => {
    if (existingData) return;
    runExtraction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingData]);

  const handleSave = useCallback(
    async (data: ReceiptData) => {
      setSaving(true);
      try {
        const result = await saveAction.executeAsync({
          receiptId,
          ...data,
        });

        if (result?.data) {
          toast.success(t("receiptVerified"));
          router.push("/dashboard");
        } else {
          toast.error(t("saveFailed"));
          setSaving(false);
        }
      } catch {
        toast.error(t("saveFailed"));
        setSaving(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [receiptId, router, t],
  );

  if (processing) {
    return <ProcessingSkeleton imageData={imageData} mimeType={mimeType} />;
  }

  // Extraction failed — show error with Retry and manual entry options
  if (extractionError && !aiData) {
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
            onClick={() => setExtractionError(null)}
          >
            {t("enterManually")}
          </Button>
        </div>
      </div>
    );
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
  );
}
