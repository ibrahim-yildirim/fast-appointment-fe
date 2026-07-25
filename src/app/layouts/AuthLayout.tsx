import { CalendarCheck } from "lucide-react"
import { Outlet } from "react-router-dom"

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="flex items-center gap-2 font-semibold">
        <CalendarCheck className="h-5 w-5 text-primary" />
        fast-appointment
      </div>
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  )
}
