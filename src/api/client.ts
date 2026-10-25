import { API_BASE_URL } from "@/api/config"
import { refreshSession } from "@/api/session"
import { ApiError, type ApiErrorBody } from "@/api/types"
import i18n from "@/i18n"
import { useAuthStore } from "@/stores/authStore"

type RequestOptions = {
  signal?: AbortSignal
}

function fallbackMessageKey(status: number) {
  if (status === 401) return "errors.unauthorized"
  if (status === 403) return "errors.forbidden"
  return "errors.generic"
}

/** Security errors (401/403) come back with an empty body, so not every error is JSON. */
async function readErrorBody(response: Response, path: string): Promise<ApiErrorBody> {
  const text = await response.text()
  try {
    return JSON.parse(text) as ApiErrorBody
  } catch {
    return {
      timestamp: new Date().toISOString(),
      status: response.status,
      error: response.statusText,
      message: fallbackMessageKey(response.status),
      path,
    }
  }
}

function isAuthPath(path: string) {
  return path.startsWith("/api/auth/") || path.startsWith("/api/business/auth/")
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: RequestOptions,
  retried = false,
): Promise<T> {
  const token = useAuthStore.getState().token

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": i18n.language,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: options?.signal,
  })

  if (!response.ok) {
    if (response.status === 401 && token && !isAuthPath(path)) {
      // The access token is short-lived: renew it once and replay the request.
      const freshToken = retried ? null : await refreshSession(token)
      if (freshToken) return request<T>(method, path, body, options, true)
      useAuthStore.getState().clearSession()
    }
    throw new ApiError(await readErrorBody(response, path))
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, body, options),
  delete: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("DELETE", path, body, options),
}
