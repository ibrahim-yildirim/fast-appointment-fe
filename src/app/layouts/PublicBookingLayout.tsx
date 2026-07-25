import { Outlet } from "react-router-dom"

import { BackButton } from "@/components/layout/BackButton"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { useBusinessContext } from "@/features/business/context/BusinessContext"

export function PublicBookingLayout() {
  const business = useBusinessContext()

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <BackButton />
          <div className="min-w-0 truncate font-semibold">{business.name}</div>
        </div>
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
