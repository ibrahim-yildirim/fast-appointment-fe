import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { customersApi, type UpdateProfileInput } from "@/features/customers/api/customersApi"
import i18n from "@/i18n"

export function useUpdateMyProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => customersApi.updateMe(input),
    onSuccess: (customer) => {
      queryClient.setQueryData(queryKeys.customers.me(), customer)
      toast.success(i18n.t("account.profileSavedToast"))
    },
    onError: (error: Error) => toast.error(i18n.t(error.message)),
  })
}
