import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBookings } from "@/features/booking/hooks/useBookings"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import {
  BUSY_WEEKS,
  busiestTimes,
  monthStats,
  type PeriodStats,
  type ServiceCount,
} from "@/features/business-onboarding/lib/overviewStats"
import { useOwnerServices } from "@/features/services/hooks/useOwnerServices"
import { businessNow, useFormatters } from "@/lib/datetime"

const hourLabel = (hour: number) => `${String(hour).padStart(2, "0")}:00`

function StatTile({ label, value, previous }: { label: string; value: string; previous: string }) {
  return (
    <Card className="gap-1 py-4">
      <CardHeader className="px-4">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-heading text-3xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 text-sm text-muted-foreground tabular-nums">{previous}</CardContent>
    </Card>
  )
}

function StatTiles({ current, previous }: { current: PeriodStats; previous: PeriodStats }) {
  const { t } = useTranslation()
  const { formatMoney } = useFormatters()
  const rate = (value: number | null) => (value === null ? "—" : `%${value}`)

  const tiles = [
    { label: t("overview.bookings"), format: (stats: PeriodStats) => String(stats.bookings) },
    { label: t("overview.revenue"), format: (stats: PeriodStats) => formatMoney(stats.revenue) },
    { label: t("overview.cancellations"), format: (stats: PeriodStats) => String(stats.cancellations) },
    { label: t("overview.noShowRate"), format: (stats: PeriodStats) => rate(stats.noShowRate) },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((tile) => (
        <StatTile
          key={tile.label}
          label={tile.label}
          value={tile.format(current)}
          previous={t("overview.previousMonth", { value: tile.format(previous) })}
        />
      ))}
    </div>
  )
}

function BreakdownCard({
  title,
  summary,
  services,
}: {
  title: string
  summary: string
  services: ServiceCount[]
}) {
  return (
    <HoverCardContent>
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{summary}</p>
      {services.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1 border-t border-border pt-2 text-xs">
          {services.map((service) => (
            <li key={service.name} className="flex justify-between gap-3">
              <span className="truncate">{service.name}</span>
              <span className="tabular-nums text-muted-foreground">{service.count}</span>
            </li>
          ))}
        </ul>
      )}
    </HoverCardContent>
  )
}

function BusiestTimes({ grid }: { grid: NonNullable<ReturnType<typeof busiestTimes>> }) {
  const { t } = useTranslation()
  const { formatTime } = useFormatters()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("overview.busiestTitle")}</CardTitle>
        <CardDescription>{t("overview.busiestHint", { weeks: BUSY_WEEKS })}</CardDescription>
      </CardHeader>
      <CardContent>
        {grid.max === 0 ? (
          <p className="text-sm text-muted-foreground">{t("overview.busiestEmpty")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-1 text-xs">
              <thead>
                <tr>
                  <th />
                  {grid.hours.map((hour) => (
                    <th key={hour} className="font-normal text-muted-foreground tabular-nums">
                      {String(hour).padStart(2, "0")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grid.rows.map((row) => (
                  <tr key={row.day}>
                    <th className="pr-2 text-left font-normal text-muted-foreground">
                      {t(`weekdayShort.${row.day}`)}
                    </th>
                    {row.cells.map((cell) => (
                      <td key={cell.hour} className="h-7 min-w-7 p-0">
                        {cell.open && (
                          <HoverCard openDelay={100} closeDelay={50}>
                            <HoverCardTrigger asChild>
                              <button
                                type="button"
                                aria-label={`${t(`weekday.${row.day}`)} ${hourLabel(cell.hour)}: ${cell.count}`}
                                className="block size-full rounded-sm border border-border outline-none transition-shadow hover:ring-2 hover:ring-ring/50 focus-visible:ring-2 focus-visible:ring-ring"
                                style={
                                  cell.count > 0
                                    ? {
                                        backgroundColor: `color-mix(in oklab, var(--gold) ${Math.round(
                                          15 + (cell.count / grid.max) * 85,
                                        )}%, transparent)`,
                                      }
                                    : undefined
                                }
                              />
                            </HoverCardTrigger>
                            <BreakdownCard
                              title={`${t(`weekday.${row.day}`)} · ${formatTime(hourLabel(cell.hour))} – ${formatTime(hourLabel(cell.hour + 1))}`}
                              summary={
                                cell.count === 0
                                  ? t("overview.noBookings")
                                  : t("overview.cellCount", { count: cell.count, weeks: BUSY_WEEKS })
                              }
                              services={cell.services}
                            />
                          </HoverCard>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardOverviewPage() {
  const { t } = useTranslation()
  const business = useBusinessContext()
  const bookingsQuery = useBookings(business.id)
  const servicesQuery = useOwnerServices(business.id)

  const isLoading = bookingsQuery.isLoading || servicesQuery.isLoading
  const bookings = bookingsQuery.data
  const services = servicesQuery.data

  const overview = useMemo(() => {
    if (!bookings || !services) return null
    const now = businessNow()
    return {
      stats: monthStats(bookings, services, now),
      grid: busiestTimes(bookings, services, business.defaultHours, now),
    }
  }, [bookings, services, business.defaultHours])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">{t("dashboard.overview")}</h1>
        <p className="text-sm text-muted-foreground">{t("overview.thisMonth")}</p>
      </div>

      {isLoading || !overview ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <StatTiles current={overview.stats.current} previous={overview.stats.previous} />
          {overview.grid && <BusiestTimes grid={overview.grid} />}
        </>
      )}
    </div>
  )
}
