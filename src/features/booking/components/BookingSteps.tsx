import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"

const steps = ["service", "time", "confirm"] as const

export type BookingStep = (typeof steps)[number]

export function BookingSteps({ current }: { current: BookingStep }) {
  const { t } = useTranslation()
  const currentIndex = steps.indexOf(current)

  return (
    <ol aria-label={t("booking.steps.label")} className="flex items-center gap-2 text-sm">
      {steps.map((step, index) => {
        const isCurrent = index === currentIndex
        const isDone = index < currentIndex

        return (
          <li key={step} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true" className="bg-border h-px w-5 sm:w-8" />}
            <span
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex items-center gap-1.5",
                isCurrent ? "text-foreground font-medium" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-xs tabular-nums",
                  isCurrent && "bg-primary text-primary-foreground",
                  isDone && "bg-foreground/10 text-foreground",
                  !isCurrent && !isDone && "border-border border",
                )}
              >
                {index + 1}
              </span>
              {t(`booking.steps.${step}`)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
