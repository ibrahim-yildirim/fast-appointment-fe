import { API_BASE_URL, USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import { toAuthSession, type BackendAuthResponse } from "@/api/mappers"
import { useAuthStore } from "@/stores/authStore"

const REFRESH_LOCK = "fast-appointment-auth-refresh"

let refreshInFlight: Promise<string | null> | null = null

/**
 * Trades the refresh token for a new session and returns the new access token, or null when
 * the session is over. Calls made by requests that failed together share one refresh, and the
 * browser lock does the same across tabs: refresh tokens are single-use, so a second refresh
 * with the same token would look like a stolen token and end every session of the user.
 *
 * Plain fetch on purpose: an expired access token in the header would make even this public
 * endpoint answer 401.
 */
export function refreshSession(expiredToken: string): Promise<string | null> {
  refreshInFlight ??= withRefreshLock(() => runRefresh(expiredToken)).finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}

/** Logout: ends the session on the server too, so the refresh token can't be used anymore. */
export function revokeSession() {
  const { refreshToken } = useAuthStore.getState()
  if (USE_FIXTURES || !refreshToken) return
  void fetch(`${API_BASE_URL}${endpoints.auth.logout()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  }).catch(() => {})
}

function withRefreshLock<T>(task: () => Promise<T>): Promise<T> {
  if (!navigator.locks) return task()
  return navigator.locks.request(REFRESH_LOCK, task)
}

async function runRefresh(expiredToken: string): Promise<string | null> {
  await useAuthStore.persist.rehydrate()
  const { token, refreshToken } = useAuthStore.getState()
  // Another tab refreshed while this one waited for the lock.
  if (token && token !== expiredToken) return token
  if (!refreshToken) return null

  const response = await fetch(`${API_BASE_URL}${endpoints.auth.refresh()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })
  if (!response.ok) return null

  const session = toAuthSession((await response.json()) as BackendAuthResponse)
  useAuthStore.getState().setSession(session)
  return session.token
}
