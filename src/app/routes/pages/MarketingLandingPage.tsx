import { CalendarCheck, Check, CircleCheck, Store, UserRound, type LucideIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link, Navigate } from "react-router-dom"

import { LanguageToggle } from "@/components/layout/LanguageToggle"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { Button } from "@/components/ui/button"
import { getSavedGuestBookings } from "@/features/booking/lib/guestBookingStorage"
import { useBusinesses } from "@/features/business/hooks/useBusinesses"
import { useFormatters } from "@/lib/datetime"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/authStore"

const steps = ["pickBusiness", "pickTime", "leaveDetails"] as const

function useAccountHome() {
  const role = useAuthStore((state) => state.role)
  const businessId = useAuthStore((state) => state.businessId)
  const { data: businesses, isLoading } = useBusinesses()

  if (role === "customer") return { to: "/account/bookings", isLoading: false }
  if (role === "business_owner") {
    if (businessId && isLoading) return { to: null, isLoading: true }
    const slug = businesses?.find((business) => business.id === businessId)?.slug
    return {
      to: slug ? `/${slug}/dashboard/bookings` : "/onboarding/business",
      isLoading: false,
    }
  }
  return { to: null, isLoading: false }
}

function Audience({
  icon: Icon,
  title,
  body,
  primary,
  secondary,
}: {
  icon: LucideIcon
  title: string
  body: string
  primary: { to: string; label: string }
  secondary: { to: string; label: string }
}) {
  return (
    <div className="bg-card border-border flex flex-col gap-3 rounded-xl border p-6">
      <Icon aria-hidden="true" className="size-5 text-gold" />
      <h2 className="font-heading text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground text-sm">{body}</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <Button size="sm" asChild>
          <Link to={primary.to}>{primary.label}</Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link to={secondary.to}>{secondary.label}</Link>
        </Button>
      </div>
    </div>
  )
}

function BookingTicket() {
  const { t } = useTranslation()
  const { formatMoney, formatTime } = useFormatters()
  const slots = [
    { time: "14:30", state: "free" },
    { time: "15:00", state: "selected" },
    { time: "15:30", state: "taken" },
    { time: "16:00", state: "free" },
  ] as const

  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-sm lg:mr-0">
      <div className="bg-gold/10 absolute -inset-8 rounded-[2.5rem] blur-2xl" />
      <div className="border-border bg-card relative -rotate-2 overflow-hidden rounded-2xl border shadow-[0_30px_60px_-30px_rgb(0_0_0/0.45)]">
        <div className="flex flex-col gap-5 p-6">
          <div className="flex items-center justify-between">
            <span className="text-gold text-[11px] font-medium tracking-[0.18em]">
              {t("landing.ticket.label")}
            </span>
            <span className="bg-gold/15 text-gold inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
              <Check className="size-3" strokeWidth={3} />
              {t("landing.ticket.confirmed")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-primary font-heading text-primary-foreground flex size-10 items-center justify-center rounded-md text-lg font-semibold">
              {t("landing.ticket.business").charAt(0)}
            </span>
            <span className="flex flex-col">
              <span className="font-medium">{t("landing.ticket.business")}</span>
              <span className="text-muted-foreground text-sm">{t("landing.ticket.service")}</span>
            </span>
          </div>
          <div className="flex items-end justify-between gap-4">
            <span className="flex flex-col gap-1">
              <span className="text-muted-foreground text-sm">{t("landing.ticket.day")}</span>
              <span className="font-heading text-5xl leading-none font-semibold tabular-nums">
                {formatTime("15:00")}
              </span>
            </span>
            <span className="text-sm font-medium tabular-nums">{formatMoney(450)}</span>
          </div>
        </div>
        <div className="border-border relative border-t border-dashed">
          <span className="bg-background absolute top-0 -left-3 size-6 -translate-y-1/2 rounded-full" />
          <span className="bg-background absolute top-0 -right-3 size-6 -translate-y-1/2 rounded-full" />
        </div>
        <div className="flex flex-wrap gap-2 p-6 pt-5">
          {slots.map((slot) => (
            <span
              key={slot.time}
              className={cn(
                "rounded-md border px-2.5 py-1.5 text-sm tabular-nums",
                slot.state === "selected" && "border-gold bg-gold text-gold-foreground font-medium",
                slot.state === "free" && "border-border",
                slot.state === "taken" &&
                  "border-border text-muted-foreground line-through opacity-60",
              )}
            >
              {formatTime(slot.time)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function MarketingLandingPage() {
  const { t } = useTranslation()
  const accountHome = useAccountHome()

  if (accountHome.isLoading) return null
  if (accountHome.to) return <Navigate to={accountHome.to} replace />

  const hasGuestBookings = getSavedGuestBookings().length > 0

  return (
    <>
      <header className="border-border flex items-center justify-between gap-3 border-b px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 font-semibold">
          <CalendarCheck aria-hidden="true" className="text-primary h-5 w-5 shrink-0" />
          <span className="truncate">{t("common.appName")}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col px-4 sm:px-6">
        <section className="grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col items-start gap-5">
            <p className="text-gold text-xs font-medium tracking-[0.18em]">
              {t("landing.eyebrow")}
            </p>
            <h1 className="font-heading max-w-2xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
              {t("landing.headline")}
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg">{t("landing.subheadline")}</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <Button size="lg" asChild>
                <Link to="/businesses">{t("landing.findBusiness")}</Link>
              </Button>
              <p className="text-sm">
                <CircleCheck
                  aria-hidden="true"
                  className="text-gold mr-1.5 inline size-4 align-[-3px]"
                />
                <span className="font-medium">{t("landing.noAccountTitle")}</span>{" "}
                <span className="text-muted-foreground">{t("landing.noAccountBody")}</span>
              </p>
            </div>
            {hasGuestBookings && (
              <Link
                to="/guest-bookings"
                className="hover:text-gold text-sm underline underline-offset-4"
              >
                {t("landing.deviceBookings")}
              </Link>
            )}
          </div>
          <BookingTicket />
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <Audience
            icon={UserRound}
            title={t("landing.customerTitle")}
            body={t("landing.customerBody")}
            primary={{ to: "/login", label: t("auth.logIn") }}
            secondary={{ to: "/register", label: t("auth.register") }}
          />
          <Audience
            icon={Store}
            title={t("landing.ownBusiness")}
            body={t("landing.ownBusinessBody")}
            primary={{ to: "/business/login", label: t("auth.logIn") }}
            secondary={{ to: "/business/register", label: t("landing.listYourBusiness") }}
          />
        </section>

        <ol className="mt-4 mb-12 grid gap-4 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step}
              className="bg-card border-border flex gap-4 rounded-xl border p-6 sm:flex-col sm:gap-2"
            >
              <span className="font-heading text-gold w-9 shrink-0 text-2xl tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-medium">{t(`landing.steps.${step}.title`)}</span>
                <span className="text-muted-foreground text-sm">
                  {t(`landing.steps.${step}.body`)}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </main>
    </>
  )
}
