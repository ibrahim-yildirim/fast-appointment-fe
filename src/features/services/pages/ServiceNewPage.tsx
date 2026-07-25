import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { ServiceForm } from "@/features/services/components/ServiceForm"
import { useCreateService } from "@/features/services/hooks/useCreateService"
import { useStaff } from "@/features/staff-calendar/hooks/useStaff"

export function ServiceNewPage() {
  const business = useBusinessContext()
  const { data: staff, isLoading: staffLoading } = useStaff(business.id)
  const createService = useCreateService(business.id, business.slug)

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>New service</CardTitle>
      </CardHeader>
      <CardContent>
        {staffLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <ServiceForm
            staff={staff ?? []}
            onSubmit={(values) => createService.mutate(values)}
            isSubmitting={createService.isPending}
            submitLabel="Create service"
          />
        )}
      </CardContent>
    </Card>
  )
}
