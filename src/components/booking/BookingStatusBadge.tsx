import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import type { BookingStatus } from "@/types"

const statusVariant = {
  confirmed: "secondary",
  pending: "outline",
  cancelled: "destructive",
  no_show: "outline",
} as const

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { t } = useTranslation()
  return <Badge variant={statusVariant[status]}>{t(`booking.status.${status}`)}</Badge>
}
