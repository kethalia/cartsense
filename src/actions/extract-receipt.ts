"use server";

import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { authActionClient } from "@/lib/safe-action";
import { prisma } from "@/lib/db";
import {
  buildReceiptExtractionRequest,
  imageMimeTypeSchema,
  receiptToolResultSchema,
} from "@/lib/prompts/extract-receipt";
import type { ReceiptToolResult } from "@/lib/prompts/extract-receipt";
import type {
  ExtractionResult,
  ExtractedLineItem,
  PaymentType,
} from "@/types/receipt";

const MAX_RETRIES = 3;

const extractReceiptSchema = z.object({
  receiptId: z.string().min(1, "Receipt ID is required"),
});

function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("AI extraction not configured");
  }
  return new Anthropic();
}

function isValidPaymentType(value: unknown): value is PaymentType {
  return value === "cash" || value === "card" || value === "other";
}

/** Map tool result to our ExtractionResult type */
function mapToolResult(result: ReceiptToolResult): ExtractionResult {
  const lineItems: ExtractedLineItem[] = (result.items ?? []).map((item) => ({
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    totalPrice: item.total_price,
  }));

  const fields = [
    result.merchant_name,
    result.total,
    result.transaction_date,
    result.tax,
    result.payment_method,
  ];
  const extracted = fields.filter((f) => f != null).length;
  const confidence = Number((extracted / fields.length).toFixed(2));

  return {
    vendorName: result.merchant_name ?? null,
    totalAmount: result.total ?? null,
    receiptDate: result.transaction_date ?? null,
    taxAmount: result.tax ?? null,
    paymentType: isValidPaymentType(result.payment_method)
      ? result.payment_method
      : null,
    lineItems,
    confidence,
  };
}

export const extractReceipt = authActionClient
  .schema(extractReceiptSchema)
  .action(async ({ parsedInput: { receiptId }, ctx: { userId } }) => {
    const receipt = await prisma.capturedReceipt.findUnique({
      where: { id: receiptId },
      select: {
        id: true,
        userId: true,
        imageData: true,
        mimeType: true,
      },
    });

    if (!receipt || receipt.userId !== userId) {
      throw new Error("Receipt not found");
    }

    // Validate mime type before sending to Claude
    const mimeResult = imageMimeTypeSchema.safeParse(receipt.mimeType);
    if (!mimeResult.success) {
      throw new Error(`Unsupported image type: ${receipt.mimeType}`);
    }

    await prisma.capturedReceipt.update({
      where: { id: receiptId },
      data: { extractionStatus: "processing" },
    });

    try {
      const anthropic = getAnthropicClient();
      const params = buildReceiptExtractionRequest(
        receipt.imageData,
        mimeResult.data,
      );

      let lastError: string | null = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const response = await anthropic.messages.create(params);

        // Find the tool_use block in the response
        const toolUseBlock = response.content.find(
          (block) =>
            block.type === "tool_use" && block.name === "extract_receipt",
        );

        if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
          lastError = "AI did not call the extraction tool";
          console.warn(
            `[extract-receipt] Attempt ${attempt}/${MAX_RETRIES}: no tool_use block`,
          );
          continue;
        }

        // Parse and validate the tool result with Zod
        const parsed = receiptToolResultSchema.safeParse(toolUseBlock.input);

        if (!parsed.success) {
          lastError = `Invalid tool output: ${parsed.error.issues.map((i) => i.message).join(", ")}`;
          console.warn(
            `[extract-receipt] Attempt ${attempt}/${MAX_RETRIES}: schema validation failed:`,
            parsed.error.flatten(),
          );
          continue;
        }

        // Valid result — map and persist
        const toolResult = parsed.data;
        const extractionResult = mapToolResult(toolResult);

        await prisma.capturedReceipt.update({
          where: { id: receiptId },
          data: {
            extractionStatus: "completed",
            vendorName: extractionResult.vendorName,
            totalAmount: extractionResult.totalAmount,
            receiptDate: extractionResult.receiptDate
              ? new Date(extractionResult.receiptDate)
              : null,
            taxAmount: extractionResult.taxAmount,
            paymentType: extractionResult.paymentType,
            confidence: extractionResult.confidence,
            rawExtraction: JSON.parse(JSON.stringify(toolResult)),
          },
        });

        return { status: "success", data: extractionResult };
      }

      // All retries exhausted
      console.error(
        `[extract-receipt] All ${MAX_RETRIES} attempts failed:`,
        lastError,
      );
      await prisma.capturedReceipt.update({
        where: { id: receiptId },
        data: {
          extractionStatus: "failed",
          rawExtraction: { error: lastError },
        },
      });
      return {
        status: "failed",
        error: lastError ?? "AI extraction failed after retries",
      };
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "AI extraction not configured"
      ) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : "Unknown extraction error";
      console.error("[extract-receipt] AI extraction failed:", errorMessage, {
        receiptId,
        status: (error as { status?: number }).status,
      });

      await prisma.capturedReceipt.update({
        where: { id: receiptId },
        data: {
          extractionStatus: "failed",
          rawExtraction: { error: errorMessage },
        },
      });

      return { status: "failed", error: errorMessage };
    }
  });
