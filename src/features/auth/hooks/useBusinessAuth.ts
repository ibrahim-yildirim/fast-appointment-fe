import { useMutation } from "@tanstack/react-query"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { revokeSession } from "@/api/session"
import { authApi } from "@/features/auth/api/authApi"
import { businessApi } from "@/features/business/api/businessApi"
import type {
  BusinessLoginInput,
  BusinessRegisterInput,
} from "@/features/auth/schemas/businessAuthSchemas"
import { useAuthStore } from "@/stores/authStore"
import i18n from "@/i18n"

type LocationState = { from?: { pathname: string; search: string } }

async function fallbackRedirect(businessId?: string) {
  if (!businessId) return "/onboarding/business"
  const businesses = await businessApi.list()
  const business = businesses.find((candidate) => candidate.id === businessId)
  return business ? `/${business.slug}/dashboard/bookings` : "/onboarding/business"
}

export function useBusinessAuth() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)

  const from = (location.state as LocationState | null)?.from

  const login = useMutation({
    mutationFn: (input: BusinessLoginInput) => authApi.businessLogin(input),
    onSuccess: async (session) => {
      setSession(session)
      const redirectTo = from
        ? `${from.pathname}${from.search}`
        : await fallbackRedirect(session.businessId)
      navigate(redirectTo, { replace: true })
    },
    onError: (error: Error) => toast.error(i18n.t(error.message)),
  })

  const register = useMutation({
    mutationFn: (input: BusinessRegisterInput) => authApi.businessRegister(input),
    onSuccess: async (session) => {
      setSession(session)
      navigate(await fallbackRedirect(session.businessId), { replace: true })
    },
    onError: (error: Error) => toast.error(i18n.t(error.message)),
  })

  const logout = () => {
    revokeSession()
    clearSession()
    navigate("/business/login", { replace: true })
  }

  return { login, register, logout }
}
