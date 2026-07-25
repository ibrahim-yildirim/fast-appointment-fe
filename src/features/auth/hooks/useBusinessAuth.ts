import { useMutation } from "@tanstack/react-query"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { authApi } from "@/features/auth/api/authApi"
import type {
  BusinessLoginInput,
  BusinessRegisterInput,
} from "@/features/auth/schemas/businessAuthSchemas"
import { businesses } from "@/fixtures"
import { useAuthStore } from "@/stores/authStore"

type LocationState = { from?: { pathname: string; search: string } }

function fallbackRedirect(businessId?: string) {
  if (!businessId) return "/onboarding/business"
  const business = businesses.find((candidate) => candidate.id === businessId)
  return business ? `/${business.slug}/dashboard` : "/onboarding/business"
}

export function useBusinessAuth() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)

  const from = (location.state as LocationState | null)?.from

  const login = useMutation({
    mutationFn: (input: BusinessLoginInput) => authApi.businessLogin(input),
    onSuccess: (session) => {
      setSession(session)
      const redirectTo = from ? `${from.pathname}${from.search}` : fallbackRedirect(session.businessId)
      navigate(redirectTo, { replace: true })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const register = useMutation({
    mutationFn: (input: BusinessRegisterInput) => authApi.businessRegister(input),
    onSuccess: (session) => {
      setSession(session)
      navigate(fallbackRedirect(session.businessId), { replace: true })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const logout = () => {
    clearSession()
    navigate("/business/login", { replace: true })
  }

  return { login, register, logout }
}
