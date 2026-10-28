import { ArrowLeftIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { ServiceForm } from "@/features/services/components/ServiceForm"
import { useOwnerService } from "@/features/services/hooks/useOwnerService"
import { useUpdateService } from "@/features/services/hooks/useUpdateService"
import { useOwnerStaff } from "@/features/staff-calendar/hooks/useOwnerStaff"

export function ServiceEditPage() {
  const { t } = useTranslation()
  const business = useBusinessContext()
  const { serviceId } = useParams<{ serviceId: string }>()
  const { data: service, isLoading: serviceLoading } = useOwnerService(business.id, serviceId!)
  const { data: staff, isLoading: staffLoading } = useOwnerStaff(business.id)
  const updateService = useUpdateService(business.id, serviceId!, business.slug)

  const isLoading = serviceLoading || staffLoading

  return (
    <Card className="max-w-xl">
      <CardHeader className="flex flex-row items-center gap-2">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link to={`/${business.slug}/dashboard/services`} aria-label={t("common.back")}>
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <CardTitle>{t("services.editService")}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : !service ? (
          <p className="text-muted-foreground">{t("services.notFound")}</p>
        ) : (
          <ServiceForm
            defaultValues={service}
            staff={(staff ?? []).filter((member) => member.active)}
            onSubmit={(values) => updateService.mutate(values)}
            isSubmitting={updateService.isPending}
            submitLabel={t("services.saveChanges")}
          />
        )}
      </CardContent>
    </Card>
  )
}
