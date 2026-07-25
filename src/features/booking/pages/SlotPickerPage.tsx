import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { useAvailableSlots } from "@/features/booking/hooks/useAvailableSlots"
import { formatTimeLabel, toDateKey } from "@/features/booking/lib/slotUtils"
import { useService } from "@/features/services/hooks/useService"

export function SlotPickerPage() {
  const business = useBusinessContext()
  const navigate = useNavigate()
  const { serviceId } = useParams<{ serviceId: string }>()
  const { data: service, isLoading: serviceLoading } = useService(business.id, serviceId!)
  const [date, setDate] = useState<Date>(() => new Date())
  const { data: slots, isLoading: slotsLoading } = useAvailableSlots(business.id, service, date)

  function handleSelectSlot(time: string, staffId: string) {
    const params = new URLSearchParams({ date: toDateKey(date), time, staffId })
    navigate(`/${business.slug}/book/${serviceId}/confirm?${params.toString()}`)
  }

  if (serviceLoading) {
    return <Skeleton className="h-64 w-full" />
  }

  if (!service) {
    return <p className="text-muted-foreground">Service not found.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{service.name}</h1>
        <p className="text-muted-foreground">
          {service.durationMinutes} min &middot; ${service.price.toFixed(2)}
        </p>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row">
        <Card className="w-fit">
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(value) => value && setDate(value)}
              disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
            />
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Available times</CardTitle>
          </CardHeader>
          <CardContent>
            {slotsLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : slots && slots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {slots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant="outline"
                    onClick={() => handleSelectSlot(slot.time, slot.staffId)}
                  >
                    {formatTimeLabel(slot.time)}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No open times on this day. Try another date.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
