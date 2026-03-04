'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar'

export function AppSidebar() {
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader />
      <SidebarContent />
      <SidebarFooter />
    </Sidebar>
  )
}
