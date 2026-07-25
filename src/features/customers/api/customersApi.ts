import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import { customers } from "@/fixtures"
import type { Customer } from "@/types"

export const customersApi = {
  list: async (): Promise<Customer[]> => {
    if (USE_FIXTURES) {
      return customers
    }
    return apiClient.get<Customer[]>(endpoints.customers.list())
  },
}
