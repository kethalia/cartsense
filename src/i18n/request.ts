import { hasLocale } from "next-intl"
import { getRequestConfig } from "next-intl/server"
import { routing } from "./routing"

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  const messages =
    locale === "ro"
      ? (await import("../messages/ro.json")).default
      : (await import("../messages/en.json")).default

  return {
    locale,
    messages,
    timeZone: "Europe/Bucharest",
    formats: {
      number: {
        currency: {
          style: "currency",
          currency: "RON",
        },
      },
    },
  }
})
