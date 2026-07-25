import { createContext, useContext } from "react"

import type { Business } from "@/types"

export const BusinessContext = createContext<Business | null>(null)

export function useBusinessContext() {
  const business = useContext(BusinessContext)
  if (!business) {
    throw new Error("useBusinessContext must be used within BusinessScopedLayout")
  }
  return business
}
