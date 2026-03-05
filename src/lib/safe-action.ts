import { createSafeActionClient } from 'next-safe-action'
import { auth } from '@clerk/nextjs/server'

export const actionClient = createSafeActionClient()

export const authActionClient = actionClient.use(async ({ next }) => {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  return next({ ctx: { clerkId: userId } })
})
