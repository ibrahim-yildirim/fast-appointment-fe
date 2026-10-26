import { CalendarCheck, CalendarClock, LayoutDashboard, Store, Users } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { LanguageToggle } from "@/components/layout/LanguageToggle"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { Button } from "@/components/ui/button"
import { getSavedGuestBookings } from "@/features/booking/lib/guestBookingStorage"
import { useBusinesses } from "@/features/business/hooks/useBusinesses"
import { useAuthStore } from "@/stores/authStore"

const highlights = [
  { icon: Users, key: "oneAccount" },
  { icon: LayoutDashboard, key: "runBusiness" },
  { icon: CalendarClock, key: "realtime" },
] as const

/** Where a logged-in visitor's own area is; null when nobody is logged in. */
function useAccountLink() {
  const { t } = useTranslation()
  const role = useAuthStore((state) => state.role)
  const businessId = useAuthStore((state) => state.businessId)
  const { data: businesses } = useBusinesses()

  if (role === "customer") return { to: "/account/bookings", label: t("landing.myBookings") }
  if (role === "business_owner") {
    const slug = businesses?.find((business) => business.id === businessId)?.slug
    // An owner without a business yet is sent to onboarding.
    return {
      to: slug ? `/${slug}/dashboard/bookings` : "/onboarding/business",
      label: t("landing.myDashboard"),
    }
  }
  return null
}

export function MarketingLandingPage() {
  const { t } = useTranslation()
  const account = useAccountLink()
  const hasGuestBookings = !account && getSavedGuestBookings().length > 0

  return (
    <>
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 font-semibold">
          <CalendarCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
          <span className="truncate">{t("common.appName")}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {account ? (
            <Button variant="outline" size="sm" asChild>
              <Link to={account.to}>{account.label}</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">{t("auth.logIn")}</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/business/login">{t("auth.businessLogIn")}</Link>
              </Button>
            </>
          )}
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-24">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("landing.headline")}
        </h1>
        <p className="text-muted-foreground">{t("landing.subheadline")}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="lg" asChild>
            <Link to="/businesses">{t("landing.findBusiness")}</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            {account ? (
              <Link to={account.to}>{account.label}</Link>
            ) : (
              <Link to="/login">{t("auth.logIn")}</Link>
            )}
          </Button>
          {hasGuestBookings && (
            <Button size="lg" variant="outline" asChild>
              <Link to="/guest-bookings">{t("landing.deviceBookings")}</Link>
            </Button>
          )}
        </div>

        <div className="mt-12 grid gap-6 text-left sm:grid-cols-3">
          {highlights.map(({ icon: Icon, key }) => (
            <div key={key} className="flex flex-col gap-2">
              <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-medium">{t(`landing.highlights.${key}.title`)}</h2>
              <p className="text-sm text-muted-foreground">
                {t(`landing.highlights.${key}.description`)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex w-full flex-col items-center gap-4 rounded-xl border border-border bg-muted/30 p-6 text-center sm:p-8">
          <Store aria-hidden="true" className="h-6 w-6 text-primary" />
          <div>
            <h2 className="font-medium">{t("landing.ownBusiness")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("landing.ownBusinessBody")}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link to="/business/login">{t("auth.businessLogIn")}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/business/register">{t("landing.listYourBusiness")}</Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}
