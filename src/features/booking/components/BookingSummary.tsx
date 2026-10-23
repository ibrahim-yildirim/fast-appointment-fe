import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type BookingSummaryRow = {
  label: string
  value: ReactNode
  /** Times and prices: set larger and in tabular figures so they line up and stand out. */
  emphasis?: boolean
}

/** Label/value list for a booking, like the lines on a salon receipt. */
export function BookingSummary({
  rows,
  className,
}: {
  rows: BookingSummaryRow[]
  className?: string
}) {
  return (
    <dl
      className={cn(
        "divide-border border-border bg-card divide-y rounded-lg border px-4 text-sm",
        className,
      )}
    >
      {rows.map((row) => (
        <div key={row.label} className="flex items-baseline justify-between gap-4 py-3">
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd
            className={cn(
              "text-right",
              row.emphasis ? "text-base font-semibold tabular-nums" : "font-medium",
            )}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
