import { createSafeActionClient } from "next-safe-action"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    return e.message
  },
})

export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  return next({ ctx: { userId: session.user.id, user: session.user } })
})
