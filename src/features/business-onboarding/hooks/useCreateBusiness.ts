import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { onboardingApi } from "@/features/business-onboarding/api/onboardingApi"
import type { BusinessOnboardingInput } from "@/features/business-onboarding/schemas/businessOnboardingSchema"
import { useAuthStore } from "@/stores/authStore"
import type { Business } from "@/types"
import i18n from "@/i18n"

export function useCreateBusiness() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const actorId = useAuthStore((state) => state.actorId)
  const setBusinessId = useAuthStore((state) => state.setBusinessId)

  return useMutation({
    mutationFn: (input: BusinessOnboardingInput) => onboardingApi.createBusiness(input, actorId!),
    onSuccess: (business) => {
      // OnboardingPage redirects through this list as soon as the businessId is set.
      queryClient.setQueryData<Business[]>(queryKeys.business.list(), (current) =>
        current ? [...current, business] : current,
      )
      setBusinessId(business.id)
      navigate(`/${business.slug}/dashboard/services`, { replace: true })
    },
    onError: (error: Error) => toast.error(i18n.t(error.message)),
  })
}
