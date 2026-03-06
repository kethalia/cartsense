import { betterAuth } from "better-auth"
import { prismaAdapter } from "@better-auth/prisma-adapter"
import { emailOTP } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"
import { prisma } from "@/lib/db"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: false, // we use OTP, not passwords
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // In development, log to console. In production, use Resend/Nodemailer/etc.
        console.log(`[Auth] OTP for ${email} (${type}): ${otp}`)

        // TODO: Integrate an email provider (e.g. Resend) for production:
        // await resend.emails.send({
        //   from: 'CartSense <noreply@cartsense.app>',
        //   to: email,
        //   subject: `Your CartSense code: ${otp}`,
        //   text: `Your verification code is: ${otp}`,
        // })
      },
      otpLength: 6,
      expiresIn: 300, // 5 minutes
    }),
    nextCookies(), // must be last — auto-sets cookies in server actions
  ],

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
})

export type Session = typeof auth.$Infer.Session
