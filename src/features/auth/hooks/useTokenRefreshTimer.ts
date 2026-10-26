import { useEffect } from "react"

import { USE_FIXTURES } from "@/api/config"
import { refreshSession } from "@/api/session"
import { useAuthStore } from "@/stores/authStore"

const REFRESH_BEFORE_EXPIRY_MS = 60_000

function tokenExpiresAt(token: string): number | null {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    const { exp } = JSON.parse(atob(payload)) as { exp?: unknown }
    return typeof exp === "number" ? exp * 1000 : null
  } catch {
    return null
  }
}

export function useTokenRefreshTimer() {
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    if (USE_FIXTURES || !token) return
    const expiresAt = tokenExpiresAt(token)
    if (expiresAt === null) return

    const delay = Math.max(expiresAt - REFRESH_BEFORE_EXPIRY_MS - Date.now(), 0)
    const timer = window.setTimeout(() => {
      refreshSession(token)
        .then((freshToken) => {
          if (!freshToken) useAuthStore.getState().clearSession()
        })
        .catch(() => {})
    }, delay)
    return () => window.clearTimeout(timer)
  }, [token])
}
