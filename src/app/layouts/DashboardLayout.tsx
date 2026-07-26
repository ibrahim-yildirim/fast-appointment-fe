import { CalendarCheck, CalendarDays, LayoutDashboard, LogOut, Settings, Users } from "lucide-react"
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
  { to: "settings", labelKey: "dashboard.settings", icon: Settings },
]

export function DashboardLayout() {
  const { t } = useTranslation()
  const business = useBusinessContext()
  const { logout } = useBusinessAuth()

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr]">
      <aside className="flex flex-col border-r border-border px-4 py-6">
        <div className="mb-6 px-2 font-semibold">{business.name}</div>
        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, labelKey, icon: Icon, end }) => (
            <NavLink
              key={labelKey}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
                )
              }
            >
              <Icon className="h-4 w-4" />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex flex-col">
        <header className="flex items-center justify-end gap-2 border-b border-border px-6 py-4">
          <LanguageToggle />
          <ThemeToggle />
          <Button variant="outline" size="icon" aria-label={t("common.logOut")} onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        <main className="flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
