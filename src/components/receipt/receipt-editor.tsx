"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { v4 as uuidv4 } from "uuid"
import { Plus, Trash2, Merge, Expand } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { ImageViewer } from "@/components/receipt/image-viewer"
import {
  paymentTypeSchema,
  receiptFormDataSchema,
  type ReceiptFormData,
  type ReceiptData,
  type ReceiptImage,
} from "@/schemas"
import { combineLineItems } from "@/lib/utils"

// ── Helpers ──

function formToReceiptData(data: ReceiptFormData): ReceiptData {
  return {
    vendorName: data.vendorName.trim(),
    totalAmount: parseFloat(data.totalAmount),
    receiptDate: data.receiptDate || null,
    taxAmount: data.taxAmount ? parseFloat(data.taxAmount) : null,
    paymentType: data.paymentType || null,
    lineItems: data.lineItems
      .filter((i) => i.name.trim())
      .map((i) => {
        const qty = parseFloat(i.quantity) || 1
        const price = parseFloat(i.unitPrice) || 0
        return {
          name: i.name.trim(),
          quantity: qty,
          unitPrice: price,
          totalPrice: qty * price,
        }
      }),
  }
}

// ── Main Component ──

export type ReceiptEditorProps = {
  image: ReceiptImage
  initialData: ReceiptFormData
  onSave: (data: ReceiptData) => void
  saving?: boolean
}

export function ReceiptEditor(props: ReceiptEditorProps) {
  const { image, initialData, onSave, saving } = props
  const t = useTranslations("Receipt")
  const [viewerOpen, setViewerOpen] = React.useState(false)
  const dataUri = `data:${image.mimeType};base64,${image.imageData}`

  const form = useForm<ReceiptFormData>({
    resolver: zodResolver(receiptFormDataSchema),
    defaultValues: {
      ...initialData,
      lineItems: initialData.lineItems.map((i) => ({
        ...i,
        id: i.id || uuidv4(),
      })),
    },
  })

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "lineItems",
  })

  const watchedItems = form.watch("lineItems")

  const itemsSubtotal = watchedItems.reduce(
    (sum, item) =>
      sum +
      (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0),
    0,
  )

  const hasDuplicates = (() => {
    const names = watchedItems
      .map((i) => i.name.trim().toLowerCase())
      .filter(Boolean)
    return new Set(names).size < names.length
  })()

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => onSave(formToReceiptData(data)))}
        className="space-y-6"
      >
        {/* ── Top: Image + Form side by side ── */}
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
          {/* Image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dataUri}
              alt={t("receiptImage")}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/95 shadow-sm"
              onClick={() => setViewerOpen(true)}
            >
              <Expand className="h-4 w-4" />
              <span className="sr-only">{t("viewFullImage")}</span>
            </Button>
          </div>

          {/* Form fields */}
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold mb-4">
              {t("receiptDetails")}
            </h2>

            <div className="space-y-4 flex-1">
              {/* Vendor Name */}
              <FormField
                control={form.control}
                name="vendorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("vendorName")}{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={t("vendorPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Total Amount */}
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("totalAmount")}{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">RON</span>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={t("amountPlaceholder")}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="receiptDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("receiptDate")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Tax */}
              <FormField
                control={form.control}
                name="taxAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("taxAmount")}</FormLabel>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">RON</span>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={t("taxPlaceholder")}
                          {...field}
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />

              {/* Payment Type */}
              <FormField
                control={form.control}
                name="paymentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("paymentType")}</FormLabel>
                    <div className="flex gap-2">
                      {paymentTypeSchema.options.map((value) => (
                        <Button
                          key={value}
                          type="button"
                          size="sm"
                          variant={
                            field.value === value ? "default" : "outline"
                          }
                          onClick={() => field.onChange(value)}
                          className="flex-1"
                        >
                          {t(value)}
                        </Button>
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* ── Bottom: Full-width products table ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">
              {t("products")} ({fields.length})
            </h2>
            <div className="flex gap-2">
              {hasDuplicates && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() =>
                    replace(combineLineItems(form.getValues("lineItems")))
                  }
                >
                  <Merge className="h-3 w-3" />
                  {t("combineDuplicates")}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() =>
                  append({
                    id: uuidv4(),
                    name: "",
                    quantity: "1",
                    unitPrice: "",
                  })
                }
              >
                <Plus className="h-3 w-3" />
                {t("addItem")}
              </Button>
            </div>
          </div>

          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4">
              {t("noProducts")}
            </p>
          ) : (
            <div className="space-y-2">
              {/* Column headers */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground px-0.5">
                <span className="flex-1">{t("productName")}</span>
                <span className="w-16 text-center">{t("qty")}</span>
                <span className="w-20 text-right">{t("unitPrice")}</span>
                <span className="w-20 text-right">{t("lineTotal")}</span>
                <span className="w-8" />
              </div>

              {fields.map((field, index) => {
                const qty =
                  parseFloat(watchedItems[index]?.quantity ?? "0") || 0
                const price =
                  parseFloat(watchedItems[index]?.unitPrice ?? "0") || 0
                const lineTotal = qty * price

                return (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input
                      placeholder="Product name"
                      {...form.register(`lineItems.${index}.name`)}
                      className="flex-1 text-sm h-8"
                    />
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="Qty"
                      {...form.register(`lineItems.${index}.quantity`)}
                      className="w-16 text-sm h-8 text-center"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Price"
                      {...form.register(`lineItems.${index}.unitPrice`)}
                      className="w-20 text-sm h-8 text-right"
                    />
                    <span className="w-20 text-sm text-right text-muted-foreground tabular-nums shrink-0">
                      {lineTotal > 0 ? lineTotal.toFixed(2) : "—"}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </div>
                )
              })}

              {/* Items subtotal */}
              {itemsSubtotal > 0 && (
                <div className="flex justify-end items-center gap-2 pt-3 border-t text-sm">
                  <span className="text-muted-foreground">
                    {t("itemsSubtotal")}
                  </span>
                  <span className="font-medium tabular-nums w-20 text-right">
                    {itemsSubtotal.toFixed(2)} RON
                  </span>
                  <span className="w-8" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Save ── */}
        <Button
          type="submit"
          size="lg"
          className="w-full sm:w-auto"
          disabled={saving}
        >
          {saving ? t("saving") : t("saveReceipt")}
        </Button>
      </form>

      {/* ── Image viewer modal ── */}
      <ImageViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        src={dataUri}
        alt={t("receiptImage")}
      />
    </Form>
  )
}
