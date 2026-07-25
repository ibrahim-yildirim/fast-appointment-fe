import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { onboardingApi } from "@/features/business-onboarding/api/onboardingApi"
import type { BusinessOnboardingInput } from "@/features/business-onboarding/schemas/businessOnboardingSchema"
import { useAuthStore } from "@/stores/authStore"

export function useCreateBusiness() {
  const navigate = useNavigate()
  const actorId = useAuthStore((state) => state.actorId)
  const setBusinessId = useAuthStore((state) => state.setBusinessId)

  return useMutation({
    mutationFn: (input: BusinessOnboardingInput) => onboardingApi.createBusiness(input, actorId!),
    onSuccess: (business) => {
      setBusinessId(business.id)
      navigate(`/${business.slug}/dashboard`, { replace: true })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
