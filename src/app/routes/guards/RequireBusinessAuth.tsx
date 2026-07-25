import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuthStore } from "@/stores/authStore"

export function RequireBusinessAuth() {
  const location = useLocation()
  const token = useAuthStore((state) => state.token)
  const role = useAuthStore((state) => state.role)

  if (!token || role !== "business_owner") {
    return <Navigate to="/business/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
