import {
  CalendarCheck,
  CalendarDays,
  Contact,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { NavLink, Outlet } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { LanguageToggle } from "@/components/layout/LanguageToggle"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { useBusinessAuth } from "@/features/auth/hooks/useBusinessAuth"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "", labelKey: "dashboard.overview", icon: LayoutDashboard, end: true },
  { to: "services", labelKey: "dashboard.services", icon: CalendarCheck },
  { to: "staff", labelKey: "dashboard.staff", icon: Users },
  { to: "bookings", labelKey: "dashboard.bookings", icon: CalendarDays },
  { to: "customers", labelKey: "dashboard.customers", icon: Contact },
  { to: "settings", labelKey: "dashboard.settings", icon: Settings },
]

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    "flex shrink-0 items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
    isActive
      ? "bg-secondary text-secondary-foreground"
      : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
  )
}

export function DashboardLayout() {
  const { t } = useTranslation()
  const business = useBusinessContext()
  const { logout } = useBusinessAuth()

  const links = navItems.map(({ to, labelKey, icon: Icon, end }) => (
    <NavLink key={labelKey} to={to} end={end} className={navLinkClass}>
      <Icon className="h-4 w-4" />
      {t(labelKey)}
    </NavLink>
  ))

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden flex-col border-r border-border px-4 py-6 md:flex">
        <div className="mb-6 px-2 font-semibold">{business.name}</div>
        <nav className="flex flex-col gap-1">{links}</nav>
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="flex items-center gap-2 border-b border-border px-4 py-4 md:px-6">
          <div className="min-w-0 flex-1 truncate font-semibold md:hidden">{business.name}</div>
          <div className="ml-auto flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Button variant="outline" size="icon" aria-label={t("common.logOut")} onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-border px-4 py-2 [scrollbar-width:none] md:hidden">
          {links}
        </nav>
        <main className="flex-1 px-4 py-6 md:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
