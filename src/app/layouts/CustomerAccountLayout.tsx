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

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    "flex shrink-0 items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
    isActive
      ? "bg-secondary text-secondary-foreground"
      : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
  )
}

export function CustomerAccountLayout() {
  const { t } = useTranslation()
  const { logout } = useCustomerAuth()

  const links = navItems.map(({ to, labelKey, icon: Icon }) => (
    <NavLink key={to} to={to} className={navLinkClass}>
      <Icon className="h-4 w-4" />
      {t(labelKey)}
    </NavLink>
  ))

  const privacyLink = (className?: string) => (
    <NavLink to="/account/privacy" className={(state) => cn(navLinkClass(state), className)}>
      <Shield className="h-4 w-4" />
      {t("account.privacyPolicy")}
    </NavLink>
  )

  const appName = (
    <div className="flex items-center gap-2 px-2 font-semibold">
      <CalendarCheck className="h-5 w-5 text-primary" />
      {t("common.appName")}
    </div>
  )

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden flex-col border-r border-border px-4 py-6 md:flex">
        <div className="mb-6">{appName}</div>
        <nav className="flex flex-col gap-1">{links}</nav>
        {privacyLink("mt-auto")}
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="flex items-center gap-2 border-b border-border px-4 py-4 md:px-6">
          <div className="min-w-0 flex-1 md:hidden">{appName}</div>
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
          {privacyLink()}
        </nav>
        <main className="flex-1 px-4 py-6 md:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
