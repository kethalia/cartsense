"use client"

import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

type FabButtonProps = {
  onClick: () => void
}

export function FabButton({ onClick }: FabButtonProps) {
  const t = useTranslations("Camera")

  return (
    <Button
      size="icon"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
      aria-label={t("capture")}
    >
      <Plus className="h-6 w-6" />
    </Button>
  )
}
