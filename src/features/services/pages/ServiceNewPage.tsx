import { useTranslation } from "react-i18next"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { ServiceForm } from "@/features/services/components/ServiceForm"
import { useCreateService } from "@/features/services/hooks/useCreateService"
import { useOwnerStaff } from "@/features/staff-calendar/hooks/useOwnerStaff"

export function ServiceNewPage() {
  const { t } = useTranslation()
  const business = useBusinessContext()
  const { data: staff, isLoading: staffLoading } = useOwnerStaff(business.id)
  const createService = useCreateService(business.id, business.slug)

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>{t("services.newService")}</CardTitle>
      </CardHeader>
      <CardContent>
        {staffLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <ServiceForm
            staff={(staff ?? []).filter((member) => member.active)}
            onSubmit={(values) => createService.mutate(values)}
            isSubmitting={createService.isPending}
            submitLabel={t("services.createService")}
          />
        )}
      </CardContent>
    </Card>
  )
}
