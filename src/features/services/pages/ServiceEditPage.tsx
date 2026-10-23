import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { ServiceForm } from "@/features/services/components/ServiceForm"
import { useService } from "@/features/services/hooks/useService"
import { useUpdateService } from "@/features/services/hooks/useUpdateService"
import { useStaff } from "@/features/staff-calendar/hooks/useStaff"

export function ServiceEditPage() {
  const { t } = useTranslation()
  const business = useBusinessContext()
  const { serviceId } = useParams<{ serviceId: string }>()
  const { data: service, isLoading: serviceLoading } = useService(business, serviceId!)
  const { data: staff, isLoading: staffLoading } = useStaff(business)
  const updateService = useUpdateService(business.id, serviceId!, business.slug)

  const isLoading = serviceLoading || staffLoading

  return (
    <Card className="max-w-xl">
      <CardHeader>
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
            staff={staff ?? []}
            onSubmit={(values) => updateService.mutate(values)}
            isSubmitting={updateService.isPending}
            submitLabel={t("services.saveChanges")}
          />
        )}
      </CardContent>
    </Card>
  )
}
