import { z } from "zod"

// ── Category type ──

export const categoryTypeSchema = z.enum(["receipt", "product"])
export type CategoryType = z.infer<typeof categoryTypeSchema>

// ── Full category object ──

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  nameRo: z.string().nullable(),
  slug: z.string(),
  type: categoryTypeSchema,
  color: z.string(),
  icon: z.string().nullable(),
  isCustom: z.boolean(),
  userId: z.string().nullable(),
  sortOrder: z.number(),
})

export type Category = z.infer<typeof categorySchema>

// ── Create category input ──

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  type: categoryTypeSchema,
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional(),
  icon: z.string().max(50).optional(),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>

// ── Update category input ──

export const updateCategorySchema = z.object({
  id: z.string().min(1, "Category ID is required"),
  name: z.string().min(1).max(50).optional(),
  nameRo: z.string().max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional(),
  icon: z.string().max(50).optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>

// ── Delete category input ──

export const deleteCategorySchema = z.object({
  id: z.string().min(1, "Category ID is required"),
})

export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>

// ── Get categories input ──

export const getCategoriesSchema = z.object({
  type: categoryTypeSchema.optional(),
})

export type GetCategoriesInput = z.infer<typeof getCategoriesSchema>
