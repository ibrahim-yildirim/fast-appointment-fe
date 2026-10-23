import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import { toId } from "@/api/mappers"
import { customers } from "@/fixtures"
import type { Customer } from "@/types"

// Notebook customers added by the owner may have no email, only a phone number.
type CustomerResponse = {
  id: number
  name: string
  phone: string | null
  email: string | null
}

export const customersApi = {
  list: async (): Promise<Customer[]> => {
    if (USE_FIXTURES) {
      return customers
    }
    const response = await apiClient.get<CustomerResponse[]>(endpoints.customers.list())
    return response.map((customer) => ({
      id: toId(customer.id),
      name: customer.name,
      email: customer.email ?? "",
    }))
  },
}
