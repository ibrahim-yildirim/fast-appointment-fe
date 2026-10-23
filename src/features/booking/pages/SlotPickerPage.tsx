import { useTranslation } from "react-i18next"
import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import { BookingSteps } from "@/features/booking/components/BookingSteps"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import {
  useAvailableDates,
  useAvailableSlots,
  useNextAvailableDate,
} from "@/features/booking/hooks/useAvailableSlots"
import { groupSlotsByDayPart, toDateKey } from "@/features/booking/lib/slotUtils"
import { useService } from "@/features/services/hooks/useService"
import { businessToday, useFormatters } from "@/lib/datetime"
import { formatDurationLabel } from "@/features/services/lib/durations"

export function SlotPickerPage() {
  const { t } = useTranslation()
  const { formatTime, formatMoney, formatDate, locale } = useFormatters()
  // Same wording as the confirm page: the app formats wall-clock "...Z" strings in UTC.
  const formatDay = (day: Date) =>
    formatDate(`${toDateKey(day)}T00:00:00.000Z`, {
      weekday: "long",
      month: "long",
      day: "numeric",
    })

  const business = useBusinessContext()
  const navigate = useNavigate()
  const { serviceId } = useParams<{ serviceId: string }>()
  const { data: service, isLoading: serviceLoading } = useService(business, serviceId!)
  const [today] = useState<Date>(() => businessToday())
  const [pickedDate, setPickedDate] = useState<Date | null>(null)
  const { data: nextAvailableDate, isLoading: nextDateLoading } = useNextAvailableDate(
    business,
    service,
  )
  const { data: availableDates } = useAvailableDates(business, service)
  // Until the customer picks a day themselves, open on the first day that has openings —
  // landing on a fully booked today reads as if the business has no availability at all.
  const date = pickedDate ?? nextAvailableDate ?? today
  const { data: slots, isLoading: slotsLoading } = useAvailableSlots(business, service, date)

  const dayParts = useMemo(() => groupSlotsByDayPart(slots ?? []), [slots])

  function handleSelectSlot(time: string, staffId: string) {
    const params = new URLSearchParams({ date: toDateKey(date), time, staffId })
    navigate(`/${business.slug}/book/${serviceId}/confirm?${params.toString()}`)
  }

  // Wait for the opening day before first paint, so the calendar mounts on its month.
  if (serviceLoading || nextDateLoading) {
    return <Skeleton className="h-64 w-full" />
  }

  if (!service) {
    return <p className="text-muted-foreground">{t("booking.serviceNotFound")}</p>
  }

  return (
    <div className="flex flex-col gap-8">
      <BookingSteps current="time" />
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {service.name}
        </h1>
        <p className="text-muted-foreground mt-2 tabular-nums">
          {formatDurationLabel(service.durationMinutes, t)} &middot;{" "}
          <span className="text-foreground font-semibold">{formatMoney(service.price)}</span>
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[auto_minmax(0,1fr)] md:gap-10">
        <Calendar
          mode="single"
          locale={locale}
          // react-day-picker's nav/day aria-labels are English defaults; the
          // date-fns locale doesn't cover them.
          labels={{
            labelPrevious: () => t("booking.previousMonth"),
            labelNext: () => t("booking.nextMonth"),
          }}
          selected={date}
          defaultMonth={date}
          onSelect={(value) => {
            if (value) setPickedDate(value)
          }}
          // Days without a single free time (closed days, fully booked days) can't be picked.
          disabled={(day) =>
            day < today || (availableDates !== undefined && !availableDates.has(toDateKey(day)))
          }
          className="border-border bg-card self-start rounded-lg border p-3 [--cell-size:--spacing(10)] max-md:mx-auto"
        />

        <section aria-live="polite" className="flex flex-col gap-6">
          <h2 className="font-heading text-xl font-semibold">{formatDay(date)}</h2>

          {slotsLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : dayParts.length > 0 ? (
            dayParts.map((group) => (
              <div key={group.part} className="flex flex-col gap-3">
                <h3 className="text-muted-foreground text-sm font-medium">
                  {t(`booking.dayParts.${group.part}`)}
                </h3>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-6">
                  {group.slots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant="outline"
                      className="hover:border-primary hover:bg-primary/5 hover:text-primary h-10 tabular-nums"
                      onClick={() => handleSelectSlot(slot.time, slot.staffId)}
                    >
                      {formatTime(slot.time)}
                    </Button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-muted/60 flex flex-col items-start gap-1 rounded-lg p-5 text-sm">
              <p className="text-muted-foreground">
                {nextAvailableDate === null
                  ? t("booking.noTimesInWindow")
                  : t("booking.noOpenTimes")}
              </p>
              {nextAvailableDate && toDateKey(nextAvailableDate) !== toDateKey(date) && (
                <Button
                  variant="link"
                  className="h-auto px-0"
                  onClick={() => setPickedDate(nextAvailableDate)}
                >
                  {t("booking.nextOpenDay", {
                    date: formatDay(nextAvailableDate),
                  })}
                </Button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
