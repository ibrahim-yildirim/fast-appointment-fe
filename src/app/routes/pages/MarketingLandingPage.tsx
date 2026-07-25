import { CalendarCheck, CalendarClock, LayoutDashboard, Users } from "lucide-react"
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
      <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 font-semibold">
          <CalendarCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
          <span className="truncate">fast-appointment</span>
        </div>
        <ThemeToggle />
      </header>
      <main className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-24">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Appointment booking for any service business
        </h1>
        <p className="text-muted-foreground">
          Manage services, staff availability, and bookings in one place.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link to="/businesses">Find a business</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/business/register">List your business</Link>
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
      </main>
    </>
  )
}
