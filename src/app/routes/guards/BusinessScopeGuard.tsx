import { Navigate, Outlet } from "react-router-dom"

import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { useAuthStore } from "@/stores/authStore"

export function BusinessScopeGuard() {
  const business = useBusinessContext()
  const businessId = useAuthStore((state) => state.businessId)

  if (businessId !== business.id) {
    return <Navigate to="/404" replace />
  }

  return <Outlet />
}
