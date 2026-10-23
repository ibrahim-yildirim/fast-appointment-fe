import {
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  LogOut,
  Settings,
  Shield,
  User,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { NavLink, Outlet } from "react-router-dom"

import { LanguageToggle } from "@/components/layout/LanguageToggle"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { Button } from "@/components/ui/button"
import { useCustomerAuth } from "@/features/auth/hooks/useCustomerAuth"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/account/bookings", labelKey: "account.bookings", icon: CalendarDays },
  { to: "/account/calendar", labelKey: "account.calendar", icon: CalendarRange },
  { to: "/account/profile", labelKey: "account.profile", icon: User },
  { to: "/account/settings", labelKey: "account.settings", icon: Settings },
]

export function CustomerAccountLayout() {
  const { t } = useTranslation()
  const { logout } = useCustomerAuth()

  return (
    <div className="grid min-h-screen grid-cols-[240px_minmax(0,1fr)]">
      <aside className="flex flex-col border-r border-border px-4 py-6">
        <div className="mb-6 flex items-center gap-2 px-2 font-semibold">
          <CalendarCheck className="h-5 w-5 text-primary" />
          {t("common.appName")}
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, labelKey, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
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
        <NavLink
          to="/account/privacy"
          className={({ isActive }) =>
            cn(
              "mt-auto flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
              isActive
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
            )
          }
        >
          <Shield className="h-4 w-4" />
          {t("account.privacyPolicy")}
        </NavLink>
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
