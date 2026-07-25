import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { Role } from "@/types"

type AuthState = {
  token: string | null
  role: Role | null
  actorId: string | null
  businessId: string | null
  setSession: (session: {
    token: string
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
      role: null,
      actorId: null,
      businessId: null,
      setSession: ({ token, role, actorId, businessId }) =>
        set({ token, role, actorId, businessId: businessId ?? null }),
      setBusinessId: (businessId) => set({ businessId }),
      clearSession: () => set({ token: null, role: null, actorId: null, businessId: null }),
    }),
    { name: "fast-appointment-auth" },
  ),
)
