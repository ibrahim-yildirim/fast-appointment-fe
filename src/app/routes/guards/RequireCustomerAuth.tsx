import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuthStore } from "@/stores/authStore"

export function RequireCustomerAuth() {
  const location = useLocation()
  const token = useAuthStore((state) => state.token)
  const role = useAuthStore((state) => state.role)

  if (!token || role !== "customer") {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
