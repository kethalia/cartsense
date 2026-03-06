# AGENTS.md — CartSense

> Instructions for AI coding agents operating in this repository.

## Build & Run

```bash
pnpm dev              # Dev server (Next.js 16 + Turbopack)
pnpm build            # Production build
pnpm lint             # ESLint (next/core-web-vitals + typescript)
pnpm format:check     # Biome — check formatting, imports, unused imports
pnpm format           # Biome — auto-fix all of the above
pnpm typecheck        # tsc --noEmit
pnpm knip             # Detect unused files, deps, and dead code
```

**After making changes, always run `pnpm format`** to auto-fix formatting, import ordering, and unused imports. CI enforces all five checks on every PR.

No test framework is configured. Do not add tests unless explicitly asked.

## Tech Stack

Next.js 16 (App Router) · React 19 · TypeScript 5.9 (strict) · Prisma 7 (PostgreSQL) · Better Auth · Anthropic Claude AI · shadcn/ui (new-york) · Tailwind CSS 4 · next-intl · next-safe-action · Zod 4 · React Hook Form · pnpm

## Code Style

### Formatting (enforced by Biome)
- 2-space indent, double quotes, no semicolons (Biome `asNeeded` handles insertion/removal)
- Imports auto-sorted alphabetically, no blank lines between groups
- Unused imports are errors — Biome removes them on `pnpm format`

### Naming
| Thing | Convention | Example |
|-------|-----------|---------|
| Files | kebab-case | `capture-receipt.ts`, `receipt-card.tsx` |
| Components | PascalCase exports | `CaptureFlow`, `ReceiptCard` |
| Functions | camelCase | `captureReceipt`, `handleSignOut` |
| Types/Interfaces | PascalCase | `ReceiptSummary`, `ExtractionResult` |
| Schemas | camelCase + `Schema` suffix | `receiptFormDataSchema` |
| Constants | UPPER_SNAKE_CASE | `MAX_UPLOAD_SIZE`, `AI_MODEL` |
| Route params | `params: Promise<{ locale: string }>` | Next.js 16 async params |

### Component Props
Always use `interface Props` (not `type`, not named exports):
```tsx
interface Props {
  title: string
  onSave: (data: ReceiptData) => void
}
```

### Path Alias
Always use `@/*` → `./src/*`. Never use relative paths that go above the current directory.

## Architecture Rules

### Server vs Client Components
- **Default to server components.** Only add `"use client"` when the component genuinely needs browser APIs, hooks, or interactivity.
- Server components: use `getTranslations()`, fetch data with `prisma`/`auth.api.getSession()`
- Client components: use `useTranslations()`, `useAction()`, `useRouter()` from `@/i18n/navigation`

### Server Actions (`src/lib/actions/`)
Always use `authActionClient` — the base `actionClient` should not be used unless a genuinely public action arises (discuss first).

```typescript
"use server"

import { prisma } from "@/lib/db"
import { authActionClient } from "@/lib/safe-action"
import { mySchema } from "@/schemas"

export const myAction = authActionClient
  .inputSchema(mySchema)
  .action(async ({ parsedInput: { ...fields }, ctx: { userId } }) => {
    // 1. Verify resource ownership (where: { id, userId })
    // 2. Business logic
    // 3. Return minimal payload
  })
```

### Schemas (`src/schemas/`)
- **All Zod schemas live in `src/schemas/`** — never co-locate with actions or components.
- Before creating a new schema, check if an existing one can be reused or extended.
- Each schema has a corresponding type: `type X = z.infer<typeof xSchema>`
- Re-export from `src/schemas/index.ts`.

### Database (Prisma)
- Use `select:` to limit fields for optimal query performance. Only omit `select` for simple single-record lookups where all fields are needed.
- Always verify resource ownership: `where: { id, userId }`.
- Decimal fields: cast with `Number()` at the boundary.
- Generated client lives in `src/generated/prisma/` — never edit, excluded from formatting.

### i18n (next-intl)
- **Always provide both `en.json` and `ro.json` translations** when adding UI strings. Translate Romanian properly — do not leave TODOs.
- Messages organized by namespace: `Dashboard`, `Auth`, `Camera`, `Receipt`, `Settings`, `Common`, etc.
- Server: `const t = await getTranslations("Namespace")`
- Client: `const t = useTranslations("Namespace")`
- Navigation: always use `Link`, `useRouter`, `usePathname` from `@/i18n/navigation` (locale-aware).

## UI Rules

### shadcn/ui First
Always check if a [shadcn/ui](https://ui.shadcn.com) component exists before building custom UI. Install with `pnpm dlx shadcn@latest add <component>`. Style: `new-york`, icons: `lucide-react`.

### Responsive Modals — Always
- **Desktop**: `<Dialog>` (shadcn)
- **Mobile**: `<Drawer>` (vaul)
- Use `useIsMobile()` hook from `@/hooks/use-mobile` to switch.

### Lists — Use Item/ItemGroup
For any list-like UI, use the `Item`, `ItemGroup`, `ItemHeader`, `ItemContent`, `ItemActions` components from `@/components/ui/item`. Do not build ad-hoc list layouts.

### Styling
- Use `cn()` from `@/lib/utils` for conditional classes (clsx + tailwind-merge).
- Semantic colors: `text-muted-foreground` (secondary), `text-destructive` (errors).
- Numeric alignment: `tabular-nums`.
- Accessible labels: `sr-only` for screen-reader-only text.

## Error Handling

- Server actions: `try/catch` with descriptive `throw new Error("...")`.
- Prisma errors: check error code (e.g., `P2002` for unique violations).
- Client-side: use `toast.error(t("errorKey"))` via sonner for most user-facing errors. Inline `<FormMessage>` for form validation. Use judgment for which is appropriate.
- Server-side logging: use structured format `console.error("[module] message:", error)`. If a proper logger is introduced, migrate to it.

## Constants
All app-wide constants live in `src/lib/config.ts` (upload limits, AI model, breakpoints, etc.). Do not scatter magic numbers across files.

## Git & Commits

- **Always use conventional commits**: `feat(scope):`, `fix(scope):`, `refactor(scope):`, `docs(scope):`, `ci(scope):`, `chore(scope):`
- Scopes match feature areas: `auth`, `receipt`, `dashboard`, `capture`, `i18n`, `ci`, etc.
- Do not modify files in `.planning/` — those are managed by the GSD planning system.

## Environment

- Package manager: **pnpm** (v10.30.3). Never use npm or yarn.
- Node: 22+
- Database: PostgreSQL (Docker Compose for dev: `docker-compose -f docker-compose.dev.yml up -d`)
- Required env vars: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ANTHROPIC_API_KEY`
