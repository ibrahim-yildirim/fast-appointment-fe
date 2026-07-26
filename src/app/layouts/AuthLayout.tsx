import { CalendarCheck } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link, Outlet } from "react-router-dom"

import { LanguageToggle } from "@/components/layout/LanguageToggle"
import { ThemeToggle } from "@/components/layout/ThemeToggle"

export function AuthLayout() {
  const { t } = useTranslation()

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="absolute top-4 right-4 flex items-center gap-2 sm:top-6 sm:right-6">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <Link to="/" className="flex items-center gap-2 font-semibold">
        <CalendarCheck aria-hidden="true" className="h-5 w-5 text-primary" />
        {t("common.appName")}
      </Link>
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  )
}
