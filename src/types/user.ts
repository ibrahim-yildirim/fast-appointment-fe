export type Role = "customer" | "business_owner"

export type Customer = {
  id: string
  name: string
  phone: string
  email: string
}

export type BusinessOwner = {
  id: string
  businessId: string
  name: string
  email: string
}
