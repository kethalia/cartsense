import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { PrismaClient } from "../src/generated/prisma/client"
import { ALL_CATEGORIES } from "../src/lib/data/categories"

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  console.log("Seeding standard categories...")

  let created = 0
  let updated = 0

  for (const [index, cat] of ALL_CATEGORIES.entries()) {
    const result = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        nameRo: cat.nameRo,
        type: cat.type,
        color: cat.color,
        icon: cat.icon,
        sortOrder: index,
      },
      create: {
        name: cat.name,
        nameRo: cat.nameRo,
        slug: cat.slug,
        type: cat.type,
        color: cat.color,
        icon: cat.icon,
        isCustom: false,
        userId: null,
        sortOrder: index,
      },
    })

    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      created++
    } else {
      updated++
    }
  }

  console.log(
    `Done! ${created} created, ${updated} updated. Total: ${ALL_CATEGORIES.length} categories.`,
  )

  await prisma.$disconnect()
  await pool.end()
}

main().catch((e) => {
  console.error("Seed failed:", e)
  process.exit(1)
})
