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

function toCustomer(customer: CustomerResponse): Customer {
  return {
    id: toId(customer.id),
    name: customer.name,
    phone: customer.phone ?? "",
    email: customer.email ?? "",
  }
}

export type CreateCustomerInput = Pick<Customer, "name" | "phone" | "email">

export type UpdateProfileInput = Pick<Customer, "name" | "phone">

export const customersApi = {
  list: async (): Promise<Customer[]> => {
    if (USE_FIXTURES) {
      return customers
    }
    const response = await apiClient.get<CustomerResponse[]>(endpoints.customers.list())
    return response.map(toCustomer)
  },

  // Adds someone to the owner's notebook; the backend rejects a phone number that's already there.
  create: async (input: CreateCustomerInput): Promise<Customer> => {
    if (USE_FIXTURES) {
      const customer: Customer = { id: `cust-${Date.now()}`, ...input }
      customers.push(customer)
      return customer
    }
    const response = await apiClient.post<CustomerResponse>(endpoints.customers.create(), {
      name: input.name,
      phone: input.phone,
      email: input.email || null,
    })
    return toCustomer(response)
  },

  // The logged-in customer's own record; the email is the login and can't be changed here.
  me: async (): Promise<Customer> => {
    if (USE_FIXTURES) {
      return customers[0]
    }
    return toCustomer(await apiClient.get<CustomerResponse>(endpoints.customers.me()))
  },

  updateMe: async (input: UpdateProfileInput): Promise<Customer> => {
    if (USE_FIXTURES) {
      Object.assign(customers[0], input)
      return customers[0]
    }
    const response = await apiClient.put<CustomerResponse>(endpoints.customers.me(), {
      name: input.name,
      phone: input.phone,
    })
    return toCustomer(response)
  },
}
