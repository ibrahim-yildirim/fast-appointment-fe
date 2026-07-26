import { CalendarCheck, CalendarClock, LayoutDashboard, Search, Store, Users } from "lucide-react"
import { Link } from "react-router-dom"

import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { Button } from "@/components/ui/button"

const highlights = [
  {
    icon: Users,
    title: "One account, any business",
    description: "Book and manage appointments across every business on the platform.",
  },
  {
    icon: LayoutDashboard,
    title: "Run your business",
    description: "Manage services, staff, and your calendar from one dashboard.",
  },
  {
    icon: CalendarClock,
    title: "Real-time availability",
    description: "See open slots instantly based on staff schedules, no back-and-forth.",
  },
]

export function MarketingLandingPage() {
  return (
    <>
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 font-semibold">
          <CalendarCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
          <span className="truncate">fast-appointment</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/business/login">Business log in</Link>
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-24">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Appointment booking for any service business
        </h1>
        <p className="text-muted-foreground">
          Manage services, staff availability, and bookings in one place.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="lg" asChild>
            <Link to="/businesses">Find a business</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/login">Log in</Link>
          </Button>
        </div>

        <div className="mt-12 grid gap-6 text-left sm:grid-cols-3">
          {highlights.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col gap-2">
              <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-medium">{title}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex w-full flex-col items-center gap-4 rounded-xl border border-border bg-muted/30 p-6 text-center sm:p-8">
          <Search aria-hidden="true" className="h-6 w-6 text-primary" />
          <div>
            <h2 className="font-medium">Booked as a guest?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Find, view, or cancel your appointment with your booking reference — no account
              needed.
            </p>
          </div>
          <Button asChild>
            <Link to="/booking-lookup">Find my booking</Link>
          </Button>
        </div>

        <div className="mt-6 flex w-full flex-col items-center gap-4 rounded-xl border border-border bg-muted/30 p-6 text-center sm:p-8">
          <Store aria-hidden="true" className="h-6 w-6 text-primary" />
          <div>
            <h2 className="font-medium">Own a service business?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              List your services, manage staff schedules, and take bookings online.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link to="/business/login">Business log in</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/business/register">List your business</Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}
