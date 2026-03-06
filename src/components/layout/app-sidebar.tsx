"use client"

import { Home, Settings, LogOut } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "@/lib/auth-client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Link, usePathname } from "@/i18n/navigation"
import { LocaleSwitcher } from "@/components/layout/locale-switcher"
import { ThemeToggle } from "@/components/layout/theme-toggle"

export function AppSidebar() {
  const t = useTranslations("Sidebar")
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  const user = session?.user

  const navItems = [
    {
      title: t("dashboard"),
      href: "/dashboard",
      icon: Home,
    },
    {
      title: t("settings"),
      href: "/settings",
      icon: Settings,
    },
  ]

  const displayEmail = user?.email || ""

  async function handleSignOut() {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/")
        },
      },
    })
  }

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="p-4">
        <span className="text-lg font-semibold tracking-tight">CartSense</span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("navigation")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3 p-4">
        {/* Language select */}
        <LocaleSwitcher />

        {/* Theme toggle */}
        <ThemeToggle />

        <SidebarSeparator />

        {/* Email */}
        <span className="truncate px-2 text-xs text-muted-foreground">
          {displayEmail}
        </span>

        {/* Sign out */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut />
              <span>{t("signOut")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
