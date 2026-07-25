import { format } from "date-fns"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CalendarFilters } from "@/features/dashboard-bookings/hooks/useCalendarAppointments"
import { getWeekDays, type CalendarView } from "@/lib/calendarUtils"
import type { Service, Staff } from "@/types"

const views: { value: CalendarView; label: string }[] = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "day", label: "Day" },
  { value: "list", label: "List" },
]

function rangeLabel(view: CalendarView, referenceDate: Date) {
  if (view === "month") return format(referenceDate, "MMMM yyyy")
  if (view === "day") return format(referenceDate, "EEEE, MMMM d, yyyy")
  if (view === "list") return "All appointments"
  const week = getWeekDays(referenceDate)
  const start = week[0]
  const end = week[6]
  return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`
}

export function CalendarToolbar({
  view,
  onViewChange,
  referenceDate,
  onNavigate,
  onToday,
  filters,
  onFiltersChange,
  services,
  staff,
}: {
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  referenceDate: Date
  onNavigate: (direction: "prev" | "next") => void
  onToday: () => void
  filters: CalendarFilters
  onFiltersChange: (filters: CalendarFilters) => void
  services: Service[]
  staff: Staff[]
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onToday}>
            Today
          </Button>
          {view !== "list" && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Previous"
                onClick={() => onNavigate("prev")}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Next"
                onClick={() => onNavigate("next")}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
          <span className="text-sm font-medium">{rangeLabel(view, referenceDate)}</span>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          {views.map(({ value, label }) => (
            <Button
              key={value}
              size="sm"
              variant={view === value ? "secondary" : "ghost"}
              onClick={() => onViewChange(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search customer or service..."
          value={filters.search}
          onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
          className="max-w-xs"
        />
        <Select
          value={filters.staffId}
          onValueChange={(value) => onFiltersChange({ ...filters, staffId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Staff" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All staff</SelectItem>
            {staff.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.serviceId}
          onValueChange={(value) => onFiltersChange({ ...filters, serviceId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All services</SelectItem>
            {services.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
