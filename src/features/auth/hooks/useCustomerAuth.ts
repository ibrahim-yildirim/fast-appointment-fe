import { useMutation } from "@tanstack/react-query"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { revokeSession } from "@/api/session"
import { authApi } from "@/features/auth/api/authApi"
import type {
  CustomerLoginInput,
  CustomerRegisterInput,
} from "@/features/auth/schemas/customerAuthSchemas"
import { useAuthStore } from "@/stores/authStore"
import i18n from "@/i18n"

type LocationState = { from?: { pathname: string; search: string } }

export function useCustomerAuth() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)

  const from = (location.state as LocationState | null)?.from
  const redirectTo = from ? `${from.pathname}${from.search}` : "/account/bookings"

  const login = useMutation({
    mutationFn: (input: CustomerLoginInput) => authApi.customerLogin(input),
    onSuccess: (session) => {
      setSession(session)
      navigate(redirectTo, { replace: true })
    },
    onError: (error: Error) => toast.error(i18n.t(error.message)),
  })

  const register = useMutation({
    mutationFn: (input: CustomerRegisterInput) => authApi.customerRegister(input),
    onSuccess: (session) => {
      setSession(session)
      navigate(redirectTo, { replace: true })
    },
    onError: (error: Error) => toast.error(i18n.t(error.message)),
  })

  const logout = () => {
    revokeSession()
    clearSession()
    navigate("/", { replace: true })
  }

  return { login, register, logout }
}
