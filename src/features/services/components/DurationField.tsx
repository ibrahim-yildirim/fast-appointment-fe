import { MinusIcon, PlusIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
  commonServiceDurations,
  formatDurationLabel,
  maxServiceDuration,
  minServiceDuration,
} from "@/features/services/lib/durations"
import { SLOT_INTERVAL_MINUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"

/**
 * Duration picker: one-tap chips for the durations businesses actually use, plus a
 * stepper for anything in between. Replaces a 24-item dropdown that hid most of its
 * options behind a scroll.
 */
export function DurationField({
  value,
  onChange,
  id,
}: {
  value: number
  onChange: (minutes: number) => void
  id?: string
}) {
  const { t } = useTranslation()

  const clamp = (minutes: number) =>
    Math.min(maxServiceDuration, Math.max(minServiceDuration, minutes))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {commonServiceDurations.map((minutes, index) => (
          <Button
            key={minutes}
            id={index === 0 ? id : undefined}
            type="button"
            size="sm"
            variant={minutes === value ? "default" : "outline"}
            aria-pressed={minutes === value}
            onClick={() => onChange(minutes)}
          >
            {formatDurationLabel(minutes, t)}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{t("services.durationFineTune")}</span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={t("services.durationDecrease", { step: SLOT_INTERVAL_MINUTES })}
            disabled={value <= minServiceDuration}
            onClick={() => onChange(clamp(value - SLOT_INTERVAL_MINUTES))}
          >
            <MinusIcon className="h-4 w-4" />
          </Button>
          <span
            aria-live="polite"
            className={cn(
              "min-w-28 text-center text-sm font-medium tabular-nums",
              !commonServiceDurations.includes(value) && "text-foreground",
            )}
          >
            {formatDurationLabel(value, t)}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={t("services.durationIncrease", { step: SLOT_INTERVAL_MINUTES })}
            disabled={value >= maxServiceDuration}
            onClick={() => onChange(clamp(value + SLOT_INTERVAL_MINUTES))}
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
