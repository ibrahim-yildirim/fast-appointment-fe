import { format, type Locale } from "date-fns"
import type { TFunction } from "i18next"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CalendarFilters } from "@/features/dashboard-bookings/hooks/useCalendarAppointments"
import { getWeekDays, type CalendarView } from "@/lib/calendarUtils"
import { useFormatters } from "@/lib/datetime"
import type { Service, Staff } from "@/types"

const views: { value: CalendarView; labelKey: string }[] = [
  { value: "month", labelKey: "dashboard.month" },
  { value: "week", labelKey: "dashboard.week" },
  { value: "day", labelKey: "dashboard.day" },
  { value: "list", labelKey: "dashboard.list" },
]

function rangeLabel(
  view: CalendarView,
  referenceDate: Date,
  locale: Locale,
  t: TFunction,
): string {
  if (view === "month") return format(referenceDate, "MMMM yyyy", { locale })
  if (view === "day") return format(referenceDate, "PPPP", { locale })
  if (view === "list") return t("dashboard.allAppointments")
  const week = getWeekDays(referenceDate)
  const start = week[0]
  const end = week[6]
  // Turkish puts the day before the month ("26 Eki – 1 Kas 2026").
  if (locale.code === "tr") {
    return `${format(start, "d MMM", { locale })} – ${format(end, "d MMM yyyy", { locale })}`
  }
  return `${format(start, "MMM d", { locale })} – ${format(end, "MMM d, yyyy", { locale })}`
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
  const { t } = useTranslation()
  const { locale } = useFormatters()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onToday}>
            {t("dashboard.today")}
          </Button>
          {view !== "list" && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t("dashboard.previous")}
                onClick={() => onNavigate("prev")}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t("dashboard.next")}
                onClick={() => onNavigate("next")}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
          <span className="text-sm font-medium">{rangeLabel(view, referenceDate, locale, t)}</span>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          {views.map(({ value, labelKey }) => (
            <Button
              key={value}
              size="sm"
              variant={view === value ? "secondary" : "ghost"}
              onClick={() => onViewChange(value)}
            >
              {t(labelKey)}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.staffId}
          onValueChange={(value) => onFiltersChange({ ...filters, staffId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("dashboard.staffFilter")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("dashboard.allStaff")}</SelectItem>
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
            <SelectValue placeholder={t("dashboard.serviceFilter")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("dashboard.allServices")}</SelectItem>
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
            <SelectValue placeholder={t("dashboard.statusFilter")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("dashboard.allStatuses")}</SelectItem>
            <SelectItem value="confirmed">{t("booking.status.confirmed")}</SelectItem>
            <SelectItem value="pending">{t("booking.status.pending")}</SelectItem>
            <SelectItem value="cancelled">{t("booking.status.cancelled")}</SelectItem>
            <SelectItem value="no_show">{t("booking.status.no_show")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
