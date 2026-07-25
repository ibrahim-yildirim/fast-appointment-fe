import {
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  LogOut,
  Settings,
  Shield,
  User,
} from "lucide-react"
import { NavLink, Outlet } from "react-router-dom"

import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { Button } from "@/components/ui/button"
import { useCustomerAuth } from "@/features/auth/hooks/useCustomerAuth"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/account/bookings", label: "Bookings", icon: CalendarDays },
  { to: "/account/calendar", label: "Calendar", icon: CalendarRange },
  { to: "/account/profile", label: "Profile", icon: User },
  { to: "/account/settings", label: "Settings", icon: Settings },
]

export function CustomerAccountLayout() {
  const { logout } = useCustomerAuth()

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr]">
      <aside className="flex flex-col border-r border-border px-4 py-6">
        <div className="mb-6 flex items-center gap-2 px-2 font-semibold">
          <CalendarCheck className="h-5 w-5 text-primary" />
          fast-appointment
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
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
              {label}
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
          Privacy policy
        </NavLink>
      </aside>
      <div className="flex flex-col">
        <header className="flex items-center justify-end gap-2 border-b border-border px-6 py-4">
          <ThemeToggle />
          <Button variant="outline" size="icon" aria-label="Log out" onClick={logout}>
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
