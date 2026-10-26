import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/api/queryKeys"
import { customersApi, type CreateCustomerInput } from "@/features/customers/api/customersApi"
import i18n from "@/i18n"

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCustomerInput) => customersApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.list() })
      toast.success(i18n.t("customers.addedToast"))
    },
    onError: (error: Error) => toast.error(i18n.t(error.message)),
  })
}
