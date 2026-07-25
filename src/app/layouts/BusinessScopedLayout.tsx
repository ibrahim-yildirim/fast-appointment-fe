import { Navigate, Outlet, useParams } from "react-router-dom"

import { Skeleton } from "@/components/ui/skeleton"
import { BusinessContext } from "@/features/business/context/BusinessContext"
import { useBusinessBySlug } from "@/features/business/hooks/useBusinessBySlug"

export function BusinessScopedLayout() {
  const { businessSlug } = useParams<{ businessSlug: string }>()
  const { data: business, isLoading } = useBusinessBySlug(businessSlug)

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
      </div>
    )
  }

  if (!business) {
    return <Navigate to="/404" replace />
  }

  return (
    <BusinessContext.Provider value={business}>
      <Outlet />
    </BusinessContext.Provider>
  )
}
