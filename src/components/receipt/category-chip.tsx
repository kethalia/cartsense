"use client"

import {
  Apple,
  Baby,
  Beef,
  Beer,
  Briefcase,
  Car,
  CircleEllipsis,
  Cookie,
  Croissant,
  Dog,
  Droplet,
  Dumbbell,
  Flame,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Leaf,
  Milk,
  Pill,
  Pizza,
  Plug,
  Sandwich,
  Shell,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Stethoscope,
  Tag,
  Utensils,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import type { ComponentType } from "react"
import { cn } from "@/lib/utils"

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  "shopping-cart": ShoppingCart,
  utensils: Utensils,
  car: Car,
  home: Home,
  heart: Heart,
  pill: Pill,
  shirt: Shirt,
  smartphone: Smartphone,
  gift: Gift,
  briefcase: Briefcase,
  "graduation-cap": GraduationCap,
  dumbbell: Dumbbell,
  zap: Zap,
  plug: Plug,
  wrench: Wrench,
  wallet: Wallet,
  tag: Tag,
  sparkles: Sparkles,
  flame: Flame,
  leaf: Leaf,
  dog: Dog,
  baby: Baby,
  beer: Beer,
  stethoscope: Stethoscope,
  "shopping-bag": ShoppingBag,
  "circle-ellipsis": CircleEllipsis,
  apple: Apple,
  beef: Beef,
  milk: Milk,
  croissant: Croissant,
  cookie: Cookie,
  pizza: Pizza,
  sandwich: Sandwich,
  droplet: Droplet,
  shell: Shell,
}

interface Props {
  category: {
    name: string
    nameRo: string | null
    color: string
    icon: string | null
  } | null
  onClick?: () => void
  size?: "sm" | "md"
}

export function CategoryChip({ category, onClick, size = "sm" }: Props) {
  const locale = useLocale()
  const t = useTranslations("ReceiptList")

  const label = category
    ? locale === "ro" && category.nameRo
      ? category.nameRo
      : category.name
    : t("uncategorized")

  const color = category?.color ?? "#9CA3AF"

  const IconComponent = category?.icon ? ICON_MAP[category.icon] : null

  const classes = cn(
    "inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap transition-colors",
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
    onClick && "cursor-pointer hover:opacity-80",
  )

  const style = {
    backgroundColor: `${color}20`,
    color,
  }

  if (onClick) {
    return (
      <button type="button" className={classes} style={style} onClick={onClick}>
        {IconComponent && (
          <IconComponent
            className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"}
          />
        )}
        {label}
      </button>
    )
  }

  return (
    <span className={classes} style={style}>
      {IconComponent && (
        <IconComponent className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      )}
      {label}
    </span>
  )
}
