"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

// ⚓ ANCHOR: SVG ICONS
// REASON: Inline SVG prevents lucide-react bundling issues in production
// PATTERN: 16x16 viewport, 2px stroke for consistency
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
)

const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6" />
  </svg>
)

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

// ⚓ ANCHOR: MAIN SIDEBAR COMPONENT
// REASON: Collapsible sidebar with proper UX - icons centered when collapsed
// UX PRINCIPLES APPLIED:
// 1. Visual Hierarchy: Icons 20px (touch-friendly), proper spacing
// 2. Consistency: Same padding/margin patterns throughout
// 3. Feedback: Active states, hover effects from shadcn/ui
// 4. Accessibility: Tooltips on collapsed state, keyboard navigation
export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { state } = useSidebar()

  // ⚓ ANCHOR: LOGOUT HANDLER
  // REASON: Sign out from Supabase + redirect to login
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  // ⚓ ANCHOR: NAVIGATION ITEMS
  // REASON: Centralized config for easy maintenance
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    { href: "/profile", label: "Profile", icon: <ProfileIcon /> },
    { href: "/settings", label: "Settings", icon: <SettingsIcon /> },
  ]

  return (
    <Sidebar collapsible="icon">
      {/* ⚓ ANCHOR: SIDEBAR HEADER */}
      {/* UX: Logo adapts to collapsed state (MRM → M) */}
      <SidebarHeader className={`border-b ${state === "expanded" ? "px-6 py-4" : "px-0 py-4 flex justify-center"}`}>
        <h2 className={`text-lg font-semibold ${state === "collapsed" ? "text-center" : ""}`}>
          {state === "expanded" ? "MRM" : "M"}
        </h2>
      </SidebarHeader>

      {/* ⚓ ANCHOR: SIDEBAR CONTENT */}
      {/* UX: Proper spacing, centered icons when collapsed */}
      <SidebarContent className={state === "collapsed" ? "flex items-center" : ""}>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              {/*
                ⚓ ANCHOR: MENU BUTTON
                UX FEATURES:
                - tooltip: Shows label on collapsed state (accessibility)
                - isActive: Visual feedback for current page
                - asChild: Delegates to Link for proper Next.js routing
              */}
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={state === "collapsed" ? item.label : undefined}
                className={state === "collapsed" ? "justify-center" : ""}
              >
                <Link href={item.href} className="flex items-center gap-3">
                  {item.icon}
                  {state === "expanded" && <span>{item.label}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* ⚓ ANCHOR: SIDEBAR FOOTER */}
      {/* UX: Logout button with proper styling and spacing */}
      <SidebarFooter className={`border-t ${state === "expanded" ? "p-4" : "p-2"}`}>
        <Button
          variant="ghost"
          className={`w-full ${state === "collapsed" ? "justify-center px-2" : "justify-start"} hover:bg-destructive/10 hover:text-destructive transition-colors`}
          onClick={handleLogout}
        >
          <LogoutIcon />
          {state === "expanded" && <span className="ml-3">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
