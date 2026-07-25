import { parseISO } from "date-fns"
import { CalendarPlus } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatTimeLabel } from "@/features/booking/lib/slotUtils"
import type { CustomerBookingView } from "@/features/my-bookings/api/customerBookingsApi"
import { BookingDetailDialog } from "@/features/my-bookings/components/BookingDetailDialog"
import { useCustomerBookings } from "@/features/my-bookings/hooks/useCustomerBookings"

const statusVariant = {
  confirmed: "secondary",
  pending: "outline",
  cancelled: "destructive",
} as const

function BookingRow({
  booking,
  onSelect,
}: {
  booking: CustomerBookingView
  onSelect: (id: string) => void
}) {
  const dateKey = booking.startsAt.slice(0, 10)
  const date = parseISO(dateKey)
  const monthLabel = date.toLocaleDateString(undefined, { month: "short" })
  const dayLabel = date.getDate()

  return (
    <button
      type="button"
      onClick={() => onSelect(booking.id)}
      className="flex items-center gap-4 rounded-xl border border-border p-4 text-left transition-colors hover:bg-secondary/50"
    >
      <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-lg bg-muted">
        <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
          {monthLabel}
        </span>
        <span className="text-lg leading-none font-semibold">{dayLabel}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{booking.serviceName}</div>
        <p className="truncate text-sm text-muted-foreground">{booking.businessName}</p>
        <p className="truncate text-sm text-muted-foreground">
          with {booking.staffName} &middot; {formatTimeLabel(booking.startsAt.slice(11, 16))}
        </p>
      </div>

      <Badge variant={statusVariant[booking.status]}>{booking.status}</Badge>
    </button>
  )
}

function BookingList({
  bookings,
  emptyLabel,
  onSelect,
  showFindBusiness = false,
}: {
  bookings: CustomerBookingView[]
  emptyLabel: string
  onSelect: (id: string) => void
  showFindBusiness?: boolean
}) {
  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-10 text-center">
        <CalendarPlus aria-hidden="true" className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        {showFindBusiness && (
          <Button variant="outline" size="sm" asChild>
            <Link to="/businesses">Find a business</Link>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {bookings.map((booking) => (
        <BookingRow key={booking.id} booking={booking} onSelect={onSelect} />
      ))}
    </div>
  )
}

export function MyBookingsPage() {
  const { data: bookings, isLoading } = useCustomerBookings()
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)

  const { upcoming, past } = useMemo(() => {
    const now = new Date()
    const all = bookings ?? []
    const upcoming = all
      .filter((booking) => new Date(booking.startsAt) >= now)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    const past = all
      .filter((booking) => new Date(booking.startsAt) < now)
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
    return { upcoming, past }
  }, [bookings])

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Bookings</h1>
          <p className="text-sm text-muted-foreground">
            Your appointments across every business.
          </p>
        </div>
        <Button asChild>
          <Link to="/businesses">Book a new appointment</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList className="group-data-horizontal/tabs:h-10">
            <TabsTrigger value="upcoming" className="px-5">
              Upcoming
              <span className="ml-1.5 text-xs text-muted-foreground">{upcoming.length}</span>
            </TabsTrigger>
            <TabsTrigger value="past" className="px-5">
              Past
              <span className="ml-1.5 text-xs text-muted-foreground">{past.length}</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-5">
            <BookingList
              bookings={upcoming}
              emptyLabel="You have no upcoming appointments."
              onSelect={setSelectedBookingId}
              showFindBusiness
            />
          </TabsContent>
          <TabsContent value="past" className="mt-5">
            <BookingList
              bookings={past}
              emptyLabel="You have no past appointments yet."
              onSelect={setSelectedBookingId}
            />
          </TabsContent>
        </Tabs>
      )}

      <BookingDetailDialog
        booking={bookings?.find((booking) => booking.id === selectedBookingId) ?? null}
        open={selectedBookingId !== null}
        onOpenChange={(open) => !open && setSelectedBookingId(null)}
      />
    </div>
  )
}
