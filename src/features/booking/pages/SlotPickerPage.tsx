import { useTranslation } from "react-i18next"
import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { useAvailableSlots, useNextAvailableDate } from "@/features/booking/hooks/useAvailableSlots"
import { groupSlotsByHour, toDateKey } from "@/features/booking/lib/slotUtils"
import { useService } from "@/features/services/hooks/useService"
import { businessToday, useFormatters } from "@/lib/datetime"
import { formatDurationLabel } from "@/features/services/lib/durations"

export function SlotPickerPage() {
  const { t } = useTranslation()
  const { formatTime, formatHour, formatMoney, locale } = useFormatters()

  const business = useBusinessContext()
  const navigate = useNavigate()
  const { serviceId } = useParams<{ serviceId: string }>()
  const { data: service, isLoading: serviceLoading } = useService(business, serviceId!)
  const [today] = useState<Date>(() => businessToday())
  const [pickedDate, setPickedDate] = useState<Date | null>(null)
  const [selectedHour, setSelectedHour] = useState<number | null>(null)
  const { data: nextAvailableDate, isLoading: nextDateLoading } = useNextAvailableDate(
    business,
    service,
  )
  // Until the guest picks a day themselves, open on the first day that has openings —
  // landing on a fully booked today reads as if the business has no availability at all.
  const date = pickedDate ?? nextAvailableDate ?? today
  const { data: slots, isLoading: slotsLoading } = useAvailableSlots(business, service, date)

  const hourGroups = useMemo(() => groupSlotsByHour(slots ?? []), [slots])
  // Looked up rather than stored, so an hour that disappears (new day, slot taken)
  // falls back to the "pick an hour" prompt on its own.
  const activeGroup = hourGroups.find((group) => group.hour === selectedHour)

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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{service.name}</h1>
        <p className="text-muted-foreground">
          {formatDurationLabel(service.durationMinutes, t)} &middot; {formatMoney(service.price)}
        </p>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row">
        <Card className="w-fit">
          <CardContent>
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
                if (!value) return
                setPickedDate(value)
                setSelectedHour(null)
              }}
              disabled={{ before: businessToday() }}
            />
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>{t("booking.availableTimes")}</CardTitle>
          </CardHeader>
          <CardContent>
            {slotsLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : hourGroups.length > 0 ? (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {hourGroups.map((group) => (
                    <Button
                      key={group.hour}
                      variant={group.hour === selectedHour ? "default" : "outline"}
                      aria-pressed={group.hour === selectedHour}
                      onClick={() => setSelectedHour(group.hour)}
                    >
                      {formatHour(group.hour)}
                    </Button>
                  ))}
                </div>

                {activeGroup ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">{formatHour(activeGroup.hour)}</p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {activeGroup.slots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant="outline"
                          onClick={() => handleSelectSlot(slot.time, slot.staffId)}
                        >
                          {formatTime(slot.time)}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("booking.pickHour")}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("booking.noOpenTimes")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
