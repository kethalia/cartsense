'use client'

import { Home, Settings, LogOut } from 'lucide-react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
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
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Link, usePathname } from '@/i18n/navigation'
import { LocaleSwitcher } from '@/components/layout/locale-switcher'
import { ThemeToggle } from '@/components/layout/theme-toggle'

export function AppSidebar() {
  const t = useTranslations('Sidebar')
  const pathname = usePathname()
  const { user } = useUser()
  const { signOut } = useClerk()

  const navItems = [
    {
      title: t('dashboard'),
      href: '/' as const,
      icon: Home,
    },
    {
      title: t('settings'),
      href: '/settings' as const,
      icon: Settings,
    },
  ]

  const displayName = user?.fullName || user?.primaryEmailAddress?.emailAddress || ''
  const displayEmail = user?.primaryEmailAddress?.emailAddress || ''
  const avatarUrl = user?.imageUrl || ''
  const initials = displayName
    ? displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : displayEmail.slice(0, 2).toUpperCase()

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="p-4">
        <span className="text-lg font-semibold tracking-tight">CartSense</span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('navigation')}</SidebarGroupLabel>
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
        {/* User profile row */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            {user?.fullName && (
              <span className="truncate text-sm font-medium">{user.fullName}</span>
            )}
            <span className="truncate text-xs text-muted-foreground">{displayEmail}</span>
          </div>
        </div>

        {/* Logout button */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ redirectUrl: '/auth' })}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut />
              <span>{t('signOut')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator />

        {/* Secondary controls */}
        <div className="space-y-3">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
