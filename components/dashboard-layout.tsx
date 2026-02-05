"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Wrench,
  Package,
  UserCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ClipboardList,
  Ship,
  TrendingUp,
  DollarSign,
  Building2,
  Moon,
  Sun,
  Settings,
  LogOut,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useLocation } from "@/contexts/location-context"
import { PersonaSwitcher } from "@/components/persona-switcher"
import { usePersona } from "@/contexts/persona-context"
import { VoiceFAB } from "@/components/voice-fab"
import { ContextualAwareness } from "@/components/contextual-awareness"

interface DashboardLayoutProps {
  children: React.ReactNode
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { selectedLocation, locations, setSelectedLocation } = useLocation()
  const [showCommandK, setShowCommandK] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()

  // Define navigation groups with explicit permissions
  const navigationGroups = [
    {
      title: null,
      items: [
        { icon: LayoutDashboard, label: "Dashboard", href: "/", permission: "dashboard" },
      ],
    },
    {
      title: "Sales",
      items: [
        { icon: Users, label: "Leads", href: "/leads", permission: "leads" },
        { icon: Building2, label: "Customers", href: "/customers", permission: "contacts" },
        { icon: FileText, label: "Quotes", href: "/quotes", permission: "quotes" },
        { icon: ShoppingCart, label: "Invoices", href: "/sales", permission: "sales" }, // Using generic 'sales' or specific if needed
        { icon: ClipboardList, label: "Field Visits", href: "/field-visits", permission: "activities" }, // Assuming activities handles visits
      ],
    },
    {
      title: "Analytics",
      items: [
        { icon: TrendingUp, label: "Performance", href: "/sales-performance", permission: "sales_performance" },
        { icon: DollarSign, label: "Commissions", href: "/commissions", permission: "commissions" },
      ],
    },
    {
      title: "Operations",
      items: [
        { icon: Wrench, label: "Service & Install", href: "/service-installation", permission: "service" },
        { icon: Wrench, label: "Maintenance", href: "/maintenance", permission: "maintenance" },
        { icon: Ship, label: "Imports", href: "/imports", permission: "settings.data_transfer.imports" }, // Specific permission from ACL
      ],
    },
    {
      title: "Resources",
      items: [
        { icon: Package, label: "Inventory", href: "/inventory", permission: "inventory" },
        { icon: UserCircle, label: "HR", href: "/hr", permission: "hr" },
      ],
    },
    {
      title: null,
      items: [
        { icon: Settings, label: "Settings", href: "/settings", permission: "settings" },
      ],
    },
  ]

  // Filter navigation groups based on permissions
  const filteredNavigationGroups = navigationGroups.map(group => {
    const filteredItems = group.items.filter(item => {
      if (!user || !user.role) return false;
      if (user.role.name === 'Super Admin' || user.role.permission_type === 'all') return true;
      // Dashboard is usually accessible to all authenticated users, or check specific permission
      if (item.href === '/') return true;

      // Check for specific permission or hierarchical
      return user.role.permissions?.includes(item.permission);
    });
    return { ...group, items: filteredItems };
  }).filter(group => group.items.length > 0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setShowCommandK((prev) => !prev)
      }
      if (e.key === "Escape") {
        setShowCommandK(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleLogout = async () => {
    await logout()
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Sidebar */}
        <aside
          className={cn(
            "flex flex-col border-r bg-sidebar transition-all duration-300",
            sidebarCollapsed ? "w-16" : "w-64",
          )}
        >
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-sidebar-border px-4">
            {!sidebarCollapsed && <h1 className="text-lg font-semibold text-sidebar-foreground">Alamia Connect</h1>}
            {sidebarCollapsed && <span className="text-lg font-bold text-sidebar-foreground">AC</span>}
          </div>

          {/* Persona Switcher */}
          <div className="p-3 border-b border-sidebar-border">
            <PersonaSwitcher collapsed={sidebarCollapsed} />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-4 p-3 overflow-y-auto">
            {filteredNavigationGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* Group Title */}
                {group.title && !sidebarCollapsed && (
                  <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.title}
                  </h3>
                )}

                {/* Group Items */}
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Link key={item.label} href={item.href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          sidebarCollapsed && "justify-center px-2",
                          pathname === item.href && "bg-sidebar-accent text-sidebar-accent-foreground",
                        )}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!sidebarCollapsed && <span className="ml-3">{item.label}</span>}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Collapse Toggle */}
          <div className="border-t border-sidebar-border p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <>
                  <ChevronLeft className="h-5 w-5" />
                  <span className="ml-2">Collapse</span>
                </>
              )}
            </Button>
          </div>

          {/* Logout Button */}
          {!sidebarCollapsed && (
            <div className="border-t border-sidebar-border p-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span className="ml-2">Logout</span>
              </Button>
            </div>
          )}

          {!sidebarCollapsed && (
            <div className="border-t border-sidebar-border px-4 py-3">
              <p className="text-xs text-muted-foreground text-center">
                Powered by <span className="font-semibold text-sidebar-foreground">Alamia Connect</span>
              </p>
              <p className="text-xs text-muted-foreground text-center mt-1">© {new Date().getFullYear()} AlamiaSoft</p>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="flex h-16 items-center justify-between border-b bg-background px-6">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search... (⌘K)"
                className="w-full pl-10 pr-4"
                onClick={() => setShowCommandK(true)}
                readOnly
              />
            </div>

            {/* Theme Toggle and Settings Buttons */}
            <div className="ml-4 flex items-center gap-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="h-9 w-9"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Settings Link */}
              <Link href="/profile">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Settings</span>
                </Button>
              </Link>

              {/* Region Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <MapPin className="h-4 w-4" />
                    <span className="hidden sm:inline">{selectedLocation?.name || "Consolidated View"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setSelectedLocation(null)}
                    className={cn(!selectedLocation && "bg-accent")}
                  >
                    Consolidated View
                  </DropdownMenuItem>
                  {locations.map((group) => (
                    <DropdownMenuItem
                      key={group.id}
                      onClick={() => setSelectedLocation(group)}
                      className={cn(selectedLocation?.id === group.id && "bg-accent")}
                    >
                      {group.name}
                    </DropdownMenuItem>
                  ))}
                  {locations.length === 0 && (
                    <DropdownMenuItem disabled>No locations found</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>

        {/* Command K Modal */}
        {showCommandK && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20"
            onClick={() => setShowCommandK(false)}
          >
            <div className="w-full max-w-2xl rounded-lg border bg-popover shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center border-b px-4 py-3">
                <Search className="mr-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for anything..."
                  className="border-0 bg-transparent focus-visible:ring-0"
                  autoFocus
                />
              </div>
              <div className="p-4 text-sm text-muted-foreground">
                <p>Start typing to search leads, sales, inventory, and more...</p>
              </div>
            </div>
          </div>
        )}

        {/* Contextual Awareness Layer */}
        <ContextualAwareness />

        {/* Voice Assistant FAB */}
        <VoiceFAB />
      </div>
    </ProtectedRoute>
  )
}

export { DashboardLayout }
export default DashboardLayout
