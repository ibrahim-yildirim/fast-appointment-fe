import { CalendarDays, Clock } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { fromDateKey, toDateKey } from "@/features/booking/lib/slotUtils"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import {
  formatDateKey,
  isDateKey,
  maskDateInput,
  maskTimeInput,
  openingHoursFor,
  parseTypedDate,
  parseTypedTime,
} from "@/features/dashboard-bookings/lib/bookingWindow"
import { businessTodayKey, useFormatters } from "@/lib/datetime"
import { cn } from "@/lib/utils"

function useAnchoredPopover(anchorId: string) {
  const [open, setOpen] = useState(false)

  return {
    open,
    setOpen,
    inputProps: {
      onClick: () => setOpen(true),
      onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Tab" || event.key === "Enter") setOpen(false)
        if (event.key === "ArrowDown") setOpen(true)
      },
    },
    contentProps: {
      onOpenAutoFocus: (event: Event) => event.preventDefault(),
      onPointerDownOutside: (event: Event) => {
        const target = event.target as HTMLElement | null
        if (target?.closest(`[data-popover-anchor="${anchorId}"]`)) event.preventDefault()
      },
    },
  }
}

export function BookingDateField({
  id,
  value,
  onChange,
  minDate,
  maxDate,
  invalid = false,
}: {
  id: string
  value: string
  onChange: (date: string) => void
  minDate: string
  maxDate: string
  invalid?: boolean
}) {
  const { t } = useTranslation()
  const { locale } = useFormatters()
  const business = useBusinessContext()
  const [text, setText] = useState(() => formatDateKey(value))
  const popover = useAnchoredPopover(id)
  const selected = isDateKey(value) ? fromDateKey(value) : undefined

  return (
    <Popover open={popover.open} onOpenChange={popover.setOpen}>
      <PopoverAnchor asChild>
        <div data-popover-anchor={id} className="relative">
          <Input
            id={id}
            value={text}
            inputMode="numeric"
            autoComplete="off"
            placeholder={t("dashboard.form.datePlaceholder")}
            aria-invalid={invalid}
            className="pr-9 tabular-nums"
            maxLength={10}
            onChange={(event) => {
              const masked = maskDateInput(event.target.value)
              setText(masked)
              onChange(parseTypedDate(masked) ?? masked)
            }}
            {...popover.inputProps}
          />
          <CalendarDays
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
        </div>
      </PopoverAnchor>
      <PopoverContent className="w-auto p-0" {...popover.contentProps}>
        <Calendar
          mode="single"
          locale={locale}
          selected={selected}
          defaultMonth={selected ?? fromDateKey(businessTodayKey())}
          startMonth={fromDateKey(minDate)}
          endMonth={fromDateKey(maxDate)}
          disabled={[
            { before: fromDateKey(minDate) },
            { after: fromDateKey(maxDate) },
            (day) => !openingHoursFor(business.defaultHours, toDateKey(day)),
          ]}
          onSelect={(day) => {
            if (!day) return
            const key = toDateKey(day)
            setText(formatDateKey(key))
            onChange(key)
            popover.setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

const timeGroups = [
  { key: "morning", from: 0, to: 12 * 60 },
  { key: "afternoon", from: 12 * 60, to: 17 * 60 },
  { key: "evening", from: 17 * 60, to: 24 * 60 },
] as const

function minutesOf(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

export function BookingTimeField({
  id,
  value,
  onChange,
  options,
  dateReady,
  invalid = false,
}: {
  id: string
  value: string
  onChange: (time: string) => void
  options: string[]
  dateReady: boolean
  invalid?: boolean
}) {
  const { t } = useTranslation()
  const { formatTime } = useFormatters()
  const [text, setText] = useState(value)
  const popover = useAnchoredPopover(id)
  const isDisabled = options.length === 0
  const placeholder = !dateReady
    ? t("dashboard.form.pickDateFirst")
    : isDisabled
      ? t("dashboard.form.noTimes")
      : t("dashboard.form.timePlaceholder")

  return (
    <Popover open={popover.open && !isDisabled} onOpenChange={popover.setOpen}>
      <PopoverAnchor asChild>
        <div data-popover-anchor={id} className="relative">
          <Input
            id={id}
            value={text}
            inputMode="numeric"
            autoComplete="off"
            disabled={isDisabled}
            placeholder={placeholder}
            aria-invalid={invalid}
            className="pr-9 tabular-nums"
            maxLength={5}
            onChange={(event) => {
              const masked = maskTimeInput(event.target.value)
              setText(masked)
              onChange(parseTypedTime(masked) ?? masked)
            }}
            {...popover.inputProps}
          />
          <Clock
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        className="max-h-80 w-80 overflow-y-auto overscroll-contain"
        {...popover.contentProps}
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          const content = event.currentTarget as HTMLElement
          requestAnimationFrame(() =>
            content.querySelector("[data-selected=true]")?.scrollIntoView({ block: "center" }),
          )
        }}
      >
        <div className="flex flex-col gap-3">
          {timeGroups.map((group) => {
            const times = options.filter(
              (time) => minutesOf(time) >= group.from && minutesOf(time) < group.to,
            )
            if (times.length === 0) return null
            return (
              <div key={group.key} className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  {t(`dashboard.form.timeGroups.${group.key}`)}
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {times.map((time) => (
                    <button
                      key={time}
                      type="button"
                      data-selected={value === time}
                      onClick={() => {
                        setText(time)
                        onChange(time)
                        popover.setOpen(false)
                      }}
                      className={cn(
                        "rounded-md border border-border px-1 py-1.5 text-xs tabular-nums transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        value === time && "border-gold bg-gold font-medium text-gold-foreground hover:bg-gold",
                      )}
                    >
                      {formatTime(time)}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
