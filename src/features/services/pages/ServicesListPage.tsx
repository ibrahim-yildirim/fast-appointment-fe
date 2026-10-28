import { useTranslation } from "react-i18next"
import { useState } from "react"
import { Link } from "react-router-dom"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { useDeleteService } from "@/features/services/hooks/useDeleteService"
import { useOwnerServices } from "@/features/services/hooks/useOwnerServices"
import { useToggleServiceActive } from "@/features/services/hooks/useToggleServiceActive"
import { useFormatters } from "@/lib/datetime"
import { cn } from "@/lib/utils"
import { formatDurationLabel } from "@/features/services/lib/durations"

export function ServicesListPage() {
  const { t } = useTranslation()
  const { formatMoney } = useFormatters()
  const business = useBusinessContext()
  const { data: services, isLoading } = useOwnerServices(business.id)
  const deleteService = useDeleteService(business.id)
  const toggleActive = useToggleServiceActive(business.id)
  const [search, setSearch] = useState("")
  const [order, setOrder] = useState<string[] | null>(null)

  if (services && order === null) {
    setOrder(
      [...services]
        .sort((a, b) => Number(b.active) - Number(a.active))
        .map((service) => service.id),
    )
  }

  const position = (id: string) => {
    const index = order?.indexOf(id) ?? -1
    return index === -1 ? Number.MAX_SAFE_INTEGER : index
  }
  const filtered = services
    ?.filter((service) => service.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => position(a.id) - position(b.id))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder={t("services.searchPlaceholder")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-xs"
        />
        <Button asChild>
          <Link to={`/${business.slug}/dashboard/services/new`}>{t("services.newService")}</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="flex flex-col gap-2">
          {filtered.map((service) => (
            <div
              key={service.id}
              className={cn(
                "flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4",
                service.active ? "border-border" : "border-dashed border-border bg-muted/40",
              )}
            >
              <div className={cn(!service.active && "text-muted-foreground")}>
                <div className="flex items-center gap-2 font-medium">
                  {service.name}
                  <Badge variant={service.active ? "default" : "outline"}>
                    {service.active ? t("services.active") : t("services.inactive")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDurationLabel(service.durationMinutes, t)} &middot; {formatMoney(service.price)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  {t("services.active")}
                  <Switch
                    checked={service.active}
                    disabled={toggleActive.isPending}
                    className="dark:data-checked:bg-primary/45"
                    thumbClassName="dark:data-checked:bg-foreground"
                    aria-label={t("services.activeToggle", { name: service.name })}
                    onCheckedChange={(active) => toggleActive.mutate({ service, active })}
                  />
                </label>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/${business.slug}/dashboard/services/${service.id}/edit`}>
                    {t("common.edit")}
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      {t("common.delete")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("services.deleteTitle", { name: service.name })}</AlertDialogTitle>
                      <AlertDialogDescription>{t("services.deleteBody")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => deleteService.mutate(service.id)}
                      >
                        {t("common.delete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground">
          {t("services.empty")}
        </div>
      )}
    </div>
  )
}
