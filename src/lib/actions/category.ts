"use server"

import { prisma } from "@/lib/db"
import { authActionClient } from "@/lib/safe-action"
import {
  createCategorySchema,
  deleteCategorySchema,
  getCategoriesSchema,
  updateCategorySchema,
} from "@/schemas"

/** Generate a URL-safe slug from a category name */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

// ── Get categories ──────────────────────────────────────────────────

export const getCategories = authActionClient
  .inputSchema(getCategoriesSchema)
  .action(async ({ parsedInput: { type }, ctx: { userId } }) => {
    const categories = await prisma.category.findMany({
      where: {
        AND: [
          // System categories OR user's custom categories
          {
            OR: [{ userId: null }, { userId }],
          },
          // Filter by type if provided
          ...(type ? [{ type }] : []),
        ],
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        nameRo: true,
        slug: true,
        type: true,
        color: true,
        icon: true,
        isCustom: true,
        userId: true,
        sortOrder: true,
      },
    })

    return { categories }
  })

// ── Create custom category ──────────────────────────────────────────

export const createCategory = authActionClient
  .inputSchema(createCategorySchema)
  .action(
    async ({ parsedInput: { name, type, color, icon }, ctx: { userId } }) => {
      let slug = slugify(name)

      // Deduplicate slug for this user's namespace
      const existing = await prisma.category.findFirst({
        where: {
          slug,
          OR: [{ userId: null }, { userId }],
        },
        select: { id: true },
      })

      if (existing) {
        slug = `${slug}-${Date.now().toString(36)}`
      }

      const category = await prisma.category.create({
        data: {
          name,
          slug,
          type,
          color: color ?? "#6B7280",
          icon: icon ?? null,
          isCustom: true,
          userId,
          sortOrder: 999,
        },
        select: {
          id: true,
          name: true,
          nameRo: true,
          slug: true,
          type: true,
          color: true,
          icon: true,
          isCustom: true,
          userId: true,
          sortOrder: true,
        },
      })

      return { category }
    },
  )

// ── Update custom category ──────────────────────────────────────────

export const updateCategory = authActionClient
  .inputSchema(updateCategorySchema)
  .action(
    async ({
      parsedInput: { id, name, nameRo, color, icon, sortOrder },
      ctx: { userId },
    }) => {
      // Only allow updating user's own custom categories
      const existing = await prisma.category.findFirst({
        where: { id, isCustom: true, userId },
        select: { id: true },
      })

      if (!existing) {
        throw new Error("Category not found or cannot be modified")
      }

      const category = await prisma.category.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(nameRo !== undefined && { nameRo }),
          ...(color !== undefined && { color }),
          ...(icon !== undefined && { icon }),
          ...(sortOrder !== undefined && { sortOrder }),
        },
        select: {
          id: true,
          name: true,
          nameRo: true,
          slug: true,
          type: true,
          color: true,
          icon: true,
          isCustom: true,
          userId: true,
          sortOrder: true,
        },
      })

      return { category }
    },
  )

// ── Delete custom category ──────────────────────────────────────────

export const deleteCategory = authActionClient
  .inputSchema(deleteCategorySchema)
  .action(async ({ parsedInput: { id }, ctx: { userId } }) => {
    // Only allow deleting user's own custom categories
    const existing = await prisma.category.findFirst({
      where: { id, isCustom: true, userId },
      select: { id: true },
    })

    if (!existing) {
      throw new Error("Category not found or cannot be deleted")
    }

    // Unlink receipts and items using this category before deletion
    await prisma.$transaction([
      prisma.capturedReceipt.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      }),
      prisma.receiptItem.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      }),
      prisma.category.delete({
        where: { id },
      }),
    ])

    return { success: true }
  })
