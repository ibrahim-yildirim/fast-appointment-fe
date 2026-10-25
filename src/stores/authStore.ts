import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { Role } from "@/types"

const AUTH_STORAGE_KEY = "fast-appointment-auth"

type AuthState = {
  token: string | null
  refreshToken: string | null
  role: Role | null
  actorId: string | null
  businessId: string | null
  setSession: (session: {
    token: string
    refreshToken: string
    role: Role
    actorId: string
    businessId?: string
  }) => void
  setBusinessId: (businessId: string) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      role: null,
      actorId: null,
      businessId: null,
      setSession: ({ token, refreshToken, role, actorId, businessId }) =>
        set({ token, refreshToken, role, actorId, businessId: businessId ?? null }),
      setBusinessId: (businessId) => set({ businessId }),
      clearSession: () =>
        set({ token: null, refreshToken: null, role: null, actorId: null, businessId: null }),
    }),
    { name: AUTH_STORAGE_KEY },
  ),
)

// Refresh tokens are single-use: a tab still holding an old one would write it back over the
// newer one, so every tab picks up another tab's login, refresh or logout right away.
window.addEventListener("storage", (event) => {
  if (event.key === AUTH_STORAGE_KEY) void useAuthStore.persist.rehydrate()
})
